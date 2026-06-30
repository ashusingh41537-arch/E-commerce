package com.suman.service;

import com.suman.dto.request.*;
import com.suman.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    void sendForgotPasswordOtp(String email);
    void verifyOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    AuthResponse googleLogin(String googleToken);
    AuthResponse refreshToken(String refreshToken);
}
