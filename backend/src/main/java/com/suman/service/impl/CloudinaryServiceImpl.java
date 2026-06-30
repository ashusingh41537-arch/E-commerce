package com.suman.service.impl;

import com.suman.service.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        try {
            String contentType = file.getContentType() != null
                ? file.getContentType() : "image/jpeg";
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            // Returns base64 data URL - works without Cloudinary
            return "data:" + contentType + ";base64," + base64;
        } catch (Exception e) {
            System.err.println("Image upload failed: " + e.getMessage());
            return null;
        }
    }

    @Override
    public void deleteImage(String publicId) { /* no-op */ }
}
