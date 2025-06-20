package utils

import (
	"regexp"
	"strings"
	"testing"
)

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name       string
		title      string
		wantPrefix string
		shouldHaveSuffix bool
	}{
		{
			name:       "simple title",
			title:      "Hello World",
			wantPrefix: "hello-world",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with special characters",
			title:      "Hello, World! How are you?",
			wantPrefix: "hello-world-how-are-you",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with numbers",
			title:      "Top 10 Programming Languages in 2023",
			wantPrefix: "top-10-programming-languages-in-2023",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with multiple spaces",
			title:      "This   has    multiple     spaces",
			wantPrefix: "this-has-multiple-spaces",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with hyphens",
			title:      "React-Router vs Vue-Router",
			wantPrefix: "react-router-vs-vue-router",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with underscores",
			title:      "snake_case vs camelCase",
			wantPrefix: "snake-case-vs-camelcase",
			shouldHaveSuffix: true,
		},
		{
			name:       "empty title",
			title:      "",
			wantPrefix: "",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with only special characters",
			title:      "!@#$%^&*()",
			wantPrefix: "",
			shouldHaveSuffix: true,
		},
		{
			name:       "title with leading/trailing spaces",
			title:      "  Leading and Trailing Spaces  ",
			wantPrefix: "leading-and-trailing-spaces",
			shouldHaveSuffix: true,
		},
		{
			name:       "unicode characters",
			title:      "How to Write Better Code",
			wantPrefix: "how-to-write-better-code",
			shouldHaveSuffix: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GenerateSlug(tt.title)
			
			if tt.shouldHaveSuffix {
				// Check if it starts with expected prefix
				if tt.wantPrefix != "" {
					expectedStart := tt.wantPrefix + "-"
					if !strings.HasPrefix(got, expectedStart) {
						t.Errorf("GenerateSlug() = %v, want to start with %v", got, expectedStart)
					}
				} else {
					// For empty prefix, should just be a number
					if !regexp.MustCompile(`^-\d+$`).MatchString(got) {
						t.Errorf("GenerateSlug() = %v, want format '-[number]' for empty title", got)
					}
				}
				
				// Check that it has a numeric suffix
				parts := strings.Split(got, "-")
				if len(parts) > 0 {
					lastPart := parts[len(parts)-1]
					if !regexp.MustCompile(`^\d+$`).MatchString(lastPart) {
						t.Errorf("GenerateSlug() = %v, should end with numeric suffix", got)
					}
				}
			}
		})
	}
}

func TestGenerateSlugUniqueness(t *testing.T) {
	// Test that similar titles produce different slugs when made unique
	titles := []string{
		"How to Learn Go",
		"How to Learn Go",  // Duplicate
		"How to Learn Go!", // Similar with punctuation
	}

	slugs := make(map[string]bool)
	
	for _, title := range titles {
		slug := GenerateSlug(title)
		baseSlug := slug
		
		// This simulates making slugs unique (which would be done in the service layer)
		counter := 1
		for slugs[slug] {
			slug = baseSlug + "-" + string(rune('0'+counter))
			counter++
		}
		
		slugs[slug] = true
		
		// Verify slug format
		if slug == "" && title != "" && !isOnlySpecialChars(title) {
			t.Errorf("GenerateSlug() returned empty slug for non-empty title: %v", title)
		}
		
		// Verify slug contains only valid characters
		if !isValidSlug(slug) {
			t.Errorf("GenerateSlug() returned invalid slug: %v", slug)
		}
	}
}

func TestGenerateSlugLongTitle(t *testing.T) {
	longTitle := strings.Repeat("This is a very long title ", 20)
	slug := GenerateSlug(longTitle)
	
	// Should not be empty
	if slug == "" {
		t.Errorf("GenerateSlug() returned empty slug for long title")
	}
	
	// Should be lowercase and contain hyphens
	if !strings.Contains(slug, "-") {
		t.Errorf("GenerateSlug() should contain hyphens for multi-word title")
	}
	
	if slug != strings.ToLower(slug) {
		t.Errorf("GenerateSlug() should return lowercase slug")
	}
}

// Helper functions for testing
func isOnlySpecialChars(s string) bool {
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == ' ' {
			return false
		}
	}
	return true
}

func isValidSlug(slug string) bool {
	if slug == "" {
		return true // Empty slug is valid
	}
	
	for _, r := range slug {
		if !((r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-') {
			return false
		}
	}
	
	// Should not start or end with hyphen
	if strings.HasPrefix(slug, "-") || strings.HasSuffix(slug, "-") {
		return false
	}
	
	// Should not have consecutive hyphens
	if strings.Contains(slug, "--") {
		return false
	}
	
	return true
}

func BenchmarkGenerateSlug(b *testing.B) {
	title := "This is a Sample Article Title for Benchmarking"
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		GenerateSlug(title)
	}
}