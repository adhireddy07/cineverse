package com.example.movie.dto;

public class LoginStep1Request {
    private String email;
    private String password;

    public LoginStep1Request() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
