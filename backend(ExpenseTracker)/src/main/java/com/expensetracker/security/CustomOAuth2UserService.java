package com.expensetracker.security;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException("Error processing OAuth2 user: " + ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        
        if (!"google".equals(registrationId)) {
            throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        if (email == null || email.trim().isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user with latest info from Google
            user = updateExistingUser(user, name, picture);
        } else {
            // Create new user
            user = createNewUser(email, name, picture);
        }

        return new CustomOAuth2User(oauth2User);
    }

    private User createNewUser(String email, String name, String picture) {
        log.info("Creating new user with email: {}", email);
        
        User user = User.builder()
                .email(email)
                .fullName(name != null ? name : "Google User")
                .username(generateUsername(email))
                .avatarUrl(picture)
                .authProvider(User.AuthProvider.GOOGLE)
                .enabled(true) // Google users are automatically enabled
                .build();

        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, String name, String picture) {
        log.info("Updating existing user with email: {}", existingUser.getEmail());
        
        boolean updated = false;

        if (name != null && !name.equals(existingUser.getFullName())) {
            existingUser.setFullName(name);
            updated = true;
        }

        if (picture != null && !picture.equals(existingUser.getAvatarUrl())) {
            existingUser.setAvatarUrl(picture);
            updated = true;
        }

        // Enable user if they're logging in via Google
        if (!existingUser.isEnabled()) {
            existingUser.setEnabled(true);
            updated = true;
        }

        if (updated) {
            return userRepository.save(existingUser);
        }

        return existingUser;
    }

    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}