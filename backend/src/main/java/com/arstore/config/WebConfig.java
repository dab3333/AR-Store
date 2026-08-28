package com.arstore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Serves admin-uploaded images (see AdminUploadController) from disk at
 * /uploads/** - separate from the frontend's own bundled /uploads assets
 * (those are static files shipped with the SPA build); this is the
 * backend's own upload storage, always referenced by the full absolute
 * URL AdminUploadController returns, never a bare "/uploads/..." path,
 * so the two never collide despite sharing a path prefix.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + new File(uploadDir).getAbsolutePath() + File.separator;
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
