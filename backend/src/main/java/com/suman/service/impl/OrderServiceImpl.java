package com.suman.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.suman.dto.request.PlaceOrderRequest;
import com.suman.dto.response.OrderDetailResponse;
import com.suman.dto.response.OrderResponse;
import com.suman.dto.response.TrackingResponse;
import com.suman.entity.*;
import com.suman.repository.*;
import com.suman.service.EmailService;
import com.suman.service.NotificationService;
import com.suman.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderTrackingRepository orderTrackingRepository;  // ✅ NEW
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Address address = addressRepository.findById(request.getAddressId())
            .orElseThrow(() -> new RuntimeException("Address not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserEmail(email);
        if (cartItems.isEmpty()) throw new RuntimeException("Cart is empty");

        // Calculate subtotal
        BigDecimal subtotal = cartItems.stream()
            .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply coupon
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode()).orElse(null);
            if (coupon != null) {
                discountAmount = calculateDiscount(coupon, subtotal);
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            }
        }

        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(499)) >= 0
            ? BigDecimal.ZERO : BigDecimal.valueOf(49);
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05));
        BigDecimal total = subtotal.subtract(discountAmount).add(shipping).add(tax);

        // Save Order
        String orderNumber = "SUM" + System.currentTimeMillis();
        Order order = Order.builder()
            .orderNumber(orderNumber).user(user).address(address)
            .subtotal(subtotal).discountAmount(discountAmount).coupon(coupon)
            .shippingCharge(shipping).taxAmount(tax).totalAmount(total)
            .paymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod()))
            .paymentStatus(Order.PaymentStatus.PENDING)
            .orderStatus(Order.OrderStatus.PENDING)
            .notes(request.getNotes())
            .estimatedDelivery(LocalDate.now().plusDays(5))
            .build();
        order = orderRepository.save(order);

        // Save Order Items
        List<OrderItem> savedItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            p.setSoldCount(p.getSoldCount() + ci.getQuantity());
            p.setStockQuantity(Math.max(0, p.getStockQuantity() - ci.getQuantity()));
            productRepository.save(p);

            String img = null;
            try {
                if (p.getImages() != null && !p.getImages().isEmpty())
                    img = p.getImages().get(0).getImageUrl();
            } catch (Exception e) { /* silent */ }

            OrderItem item = OrderItem.builder()
                .order(order).product(p).productName(p.getName())
                .productImage(img).quantity(ci.getQuantity())
                .price(p.getPrice())
                .total(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .isReviewed(false).build();
            savedItems.add(orderItemRepository.save(item));
        }

        // ✅ Save Tracking Entry - ORDER PLACED
        saveTracking(order, Order.OrderStatus.PENDING,
            "Order placed successfully! We will confirm your order shortly.",
            "Order Received");

        // Clear cart
        cartItemRepository.deleteAll(cartItems);

        // Send notifications
        try {
            notificationService.sendOrderNotification(user, order,
                "Order Placed! 🎉",
                "Your order #" + orderNumber + " has been placed. Total: ₹" + total);
            emailService.sendOrderConfirmationEmail(user.getEmail(), order);
        } catch (Exception e) {
            System.err.println("Notification failed (non-critical): " + e.getMessage());
        }

        Order finalOrder = orderRepository.findById(order.getId()).orElse(order);
        return toOrderResponse(finalOrder, savedItems);
    }

    @Override
    public List<OrderResponse> getUserOrders(String email) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(email)
            .stream().map(o -> toOrderResponse(o, null)).collect(Collectors.toList());
    }

    @Override
    public OrderDetailResponse getOrderDetail(String email, String orderNumber) {
        Order order = orderRepository.findByOrderNumberAndUserEmail(orderNumber, email)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        // ✅ Get tracking history from DB
        List<TrackingResponse> trackingHistory = orderTrackingRepository
            .findByOrderIdOrderByCreatedAtAsc(order.getId())
            .stream()
            .map(t -> TrackingResponse.builder()
                .status(t.getStatus().name())
                .message(t.getMessage())
                .location(t.getLocation())
                .createdAt(t.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        List<com.suman.dto.response.OrderItemResponse> itemResponses = items.stream()
            .map(item -> com.suman.dto.response.OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .total(item.getTotal())
                .isReviewed(item.getIsReviewed())
                .build())
            .collect(Collectors.toList());

        com.suman.dto.response.AddressResponse addressResponse = null;
        if (order.getAddress() != null) {
            Address a = order.getAddress();
            addressResponse = com.suman.dto.response.AddressResponse.builder()
                .id(a.getId()).name(a.getName()).phone(a.getPhone())
                .addressLine1(a.getAddressLine1()).addressLine2(a.getAddressLine2())
                .city(a.getCity()).state(a.getState()).pincode(a.getPincode())
                .country(a.getCountry()).isDefault(a.getIsDefault())
                .addressType(a.getAddressType()).build();
        }

        return OrderDetailResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .items(itemResponses)
            .address(addressResponse)
            .subtotal(order.getSubtotal())
            .discountAmount(order.getDiscountAmount())
            .shippingCharge(order.getShippingCharge())
            .taxAmount(order.getTaxAmount())
            .totalAmount(order.getTotalAmount())
            .paymentMethod(order.getPaymentMethod().name())
            .paymentStatus(order.getPaymentStatus().name())
            .orderStatus(order.getOrderStatus().name())
            .trackingNumber(order.getTrackingNumber())
            .estimatedDelivery(order.getEstimatedDelivery() != null
                ? order.getEstimatedDelivery().toString() : null)
            .trackingHistory(trackingHistory)   // ✅ Real tracking history
            .invoiceUrl(order.getInvoiceUrl())
            .createdAt(order.getCreatedAt())
            .build();
    }

    @Override
    @Transactional
    public void cancelOrder(String email, Long orderId, String reason) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, email)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() == Order.OrderStatus.SHIPPED
                || order.getOrderStatus() == Order.OrderStatus.DELIVERED)
            throw new RuntimeException("Cannot cancel a shipped or delivered order");

        order.setOrderStatus(Order.OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        // ✅ Save tracking entry for cancellation
        saveTracking(order, Order.OrderStatus.CANCELLED,
            "Order cancelled. Reason: " + reason, null);

        // Restore stock
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        items.forEach(item -> {
            Product p = item.getProduct();
            p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
            productRepository.save(p);
        });

        try {
            notificationService.sendOrderNotification(order.getUser(), order,
                "Order Cancelled ❌",
                "Order #" + order.getOrderNumber() + " has been cancelled.");
        } catch (Exception e) { /* silent */ }
    }

    @Override
    @Transactional
    public void returnOrder(String email, Long orderId, String reason) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, email)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() != Order.OrderStatus.DELIVERED)
            throw new RuntimeException("Only delivered orders can be returned");

        order.setOrderStatus(Order.OrderStatus.RETURNED);
        order.setCancelReason(reason);
        orderRepository.save(order);

        // ✅ Save tracking entry for return
        saveTracking(order, Order.OrderStatus.RETURNED,
            "Return request submitted. Reason: " + reason, null);
    }

    @Override
    public ResponseEntity<byte[]> generateInvoice(String email, Long orderId) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, email)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        try {
            byte[] pdf = buildInvoicePdf(order, items);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                "invoice-" + order.getOrderNumber() + ".pdf");
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException("Invoice generation failed: " + e.getMessage());
        }
    }

    // ✅ Helper method - Save tracking entry
    private void saveTracking(Order order, Order.OrderStatus status,
                               String message, String location) {
        OrderTracking tracking = OrderTracking.builder()
            .order(order)
            .status(status)
            .message(message)
            .location(location)
            .build();
        orderTrackingRepository.save(tracking);
    }

    // ---- PDF ----
    private byte[] buildInvoicePdf(Order order, List<OrderItem> items) throws Exception {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        com.itextpdf.text.Font titleFont =
            new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                24, com.itextpdf.text.Font.BOLD, new BaseColor(233, 30, 99));
        com.itextpdf.text.Font headerFont =
            new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                12, com.itextpdf.text.Font.BOLD);
        com.itextpdf.text.Font normalFont =
            new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10);
        com.itextpdf.text.Font smallFont =
            new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                8, com.itextpdf.text.Font.NORMAL, BaseColor.GRAY);

        Paragraph title = new Paragraph("SUMAN", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        Paragraph subtitle = new Paragraph("Beauty & Fashion",
            new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA,
                12, com.itextpdf.text.Font.ITALIC, BaseColor.GRAY));
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        PdfPTable info = new PdfPTable(2);
        info.setWidthPercentage(100);
        pdfRow(info, "INVOICE", "Order: #" + order.getOrderNumber(), headerFont, normalFont);
        pdfRow(info, "", "Date: " + order.getCreatedAt()
            .format(DateTimeFormatter.ofPattern("dd MMM yyyy")), normalFont, normalFont);
        document.add(info);
        document.add(Chunk.NEWLINE);

        if (order.getAddress() != null) {
            Address a = order.getAddress();
            document.add(new Paragraph("Delivery Address:", headerFont));
            document.add(new Paragraph(a.getName() + " | " + a.getPhone(), normalFont));
            document.add(new Paragraph(a.getAddressLine1() + ", "
                + a.getCity() + " - " + a.getPincode(), normalFont));
            document.add(Chunk.NEWLINE);
        }

        PdfPTable itemTable = new PdfPTable(4);
        itemTable.setWidthPercentage(100);
        itemTable.setWidths(new float[]{5, 2, 2, 2});
        for (String h : new String[]{"Product", "Qty", "Price", "Total"}) {
            PdfPCell hc = new PdfPCell(new Phrase(h, headerFont));
            hc.setBackgroundColor(new BaseColor(233, 30, 99));
            hc.setPadding(8);
            hc.setHorizontalAlignment(Element.ALIGN_CENTER);
            itemTable.addCell(hc);
        }
        for (OrderItem item : items) {
            itemTable.addCell(pdfCell(item.getProductName(), normalFont, Element.ALIGN_LEFT));
            itemTable.addCell(pdfCell(String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER));
            itemTable.addCell(pdfCell("Rs." + item.getPrice(), normalFont, Element.ALIGN_RIGHT));
            itemTable.addCell(pdfCell("Rs." + item.getTotal(), normalFont, Element.ALIGN_RIGHT));
        }
        document.add(itemTable);
        document.add(Chunk.NEWLINE);

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(45);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        pdfTotal(totals, "Subtotal:", "Rs." + order.getSubtotal(), normalFont);
        if (order.getDiscountAmount() != null
                && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0)
            pdfTotal(totals, "Discount:", "-Rs." + order.getDiscountAmount(), normalFont);
        pdfTotal(totals, "Shipping:",
            order.getShippingCharge().compareTo(BigDecimal.ZERO) == 0
                ? "FREE" : "Rs." + order.getShippingCharge(), normalFont);
        pdfTotal(totals, "GST (5%):", "Rs." + order.getTaxAmount(), normalFont);
        pdfTotal(totals, "TOTAL:", "Rs." + order.getTotalAmount(), headerFont);
        document.add(totals);
        document.add(Chunk.NEWLINE);

        Paragraph footer = new Paragraph("Thank you for shopping with SUMAN!", smallFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
        document.close();
        return out.toByteArray();
    }

    private void pdfRow(PdfPTable t, String l, String r,
            com.itextpdf.text.Font lf, com.itextpdf.text.Font rf) {
        PdfPCell lc = new PdfPCell(new Phrase(l, lf));
        lc.setBorder(Rectangle.NO_BORDER); lc.setPadding(4); t.addCell(lc);
        PdfPCell rc = new PdfPCell(new Phrase(r, rf));
        rc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rc.setBorder(Rectangle.NO_BORDER); rc.setPadding(4); t.addCell(rc);
    }

    private PdfPCell pdfCell(String text, com.itextpdf.text.Font font, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setHorizontalAlignment(align); c.setBorder(Rectangle.BOX); c.setPadding(6);
        return c;
    }

    private void pdfTotal(PdfPTable t, String label, String value,
            com.itextpdf.text.Font font) {
        PdfPCell lc = new PdfPCell(new Phrase(label, font));
        lc.setBorder(Rectangle.NO_BORDER); lc.setPadding(4); t.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(value, font));
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBorder(Rectangle.NO_BORDER); vc.setPadding(4); t.addCell(vc);
    }

    // ---- Mappers ----
    private OrderResponse toOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItem> itemList = items != null ? items :
            orderItemRepository.findByOrderId(order.getId());
        int count = itemList.size();
        String img = !itemList.isEmpty() ? itemList.get(0).getProductImage() : null;
        return OrderResponse.builder()
            .id(order.getId()).orderNumber(order.getOrderNumber())
            .totalAmount(order.getTotalAmount())
            .orderStatus(order.getOrderStatus().name())
            .paymentStatus(order.getPaymentStatus().name())
            .paymentMethod(order.getPaymentMethod().name())
            .itemCount(count).firstItemImage(img)
            .createdAt(order.getCreatedAt()).build();
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) return BigDecimal.ZERO;
        BigDecimal d;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            d = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaxDiscountAmount() != null) d = d.min(coupon.getMaxDiscountAmount());
        } else {
            d = coupon.getDiscountValue();
        }
        return d;
    }
}
