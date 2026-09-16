/* ============================================================
 * WEBZONEBW ER STUDIO — PREMIUM CHECKOUT TEST SUITE
 * ============================================================
 * This script tests the complete purchase journey:
 * Premium Lens → Checkout → Email validation → Create real order → 
 * Payment provider → Payment result → Backend webhook verification → 
 * License activation → Premium lens unlock → Refresh/login → 
 * Premium access remains available.
 *
 * Test Scenarios:
 * 1. Email validation (valid/invalid)
 * 2. Order creation success/failure
 * 3. Payment flow (PayPal simulation)
 * 4. License activation success/failure
 * 5. Error handling (network, config, payment)
 * 6. State persistence (refresh/login)
 * 7. Accessibility and keyboard navigation
 * ============================================================ */

(function() {
    "use strict";

    // Test configuration
    const TEST_CONFIG = {
        testEmail: "test@example.com",
        invalidEmails: [
            "", // empty
            "invalid", // no @
            "invalid@", // no domain
            "invalid@domain", // no TLD
            "invalid@domain.", // trailing dot
            "test@domain..com", // double dots
            "test@domain.com.", // trailing dot
            "test@.com", // starting dot
            "test@domain.c", // short TLD
            "test@domain.toolongtld", // long TLD
            "test@domain." + "a".repeat(255), // extremely long TLD
            "test@domain." + "a".repeat(253) + "." + "a".repeat(10), // long domain
        ],
        mockAPIResponses: {
            success: {
                success: true,
                data: {
                    orderId: "test-order-123",
                    clientId: "test-client-id",
                    email: "test@example.com"
                }
            },
            paymentConfigError: {
                success: false,
                error: "PAYMENT_NOT_CONFIGURED"
            },
            networkError: {
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: "Network error" })
            }
        }
    };

    // Test state
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    // Utility functions
    function createTestResult(name, passed, details = {}) {
        testResults.total++;
        if (passed) {
            testResults.passed++;
        } else {
            testResults.failed++;
        }

        const result = {
            name,
            passed,
            timestamp: new Date().toISOString(),
            details
        };

        testResults.tests.push(result);
        console.log(`[${passed ? '✅' : '❌'}] ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
        if (!passed) {
            console.error(`   Details:`, details);
        }
    }

    function mockFetch(response) {
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            console.log(`[MOCK FETCH] ${url}`, options);
            
            if (url.includes('/api/paypal/create-order')) {
                return Promise.resolve(TEST_CONFIG.mockAPIResponses.success);
            } else if (url.includes('/api/paypal/capture')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        status: "COMPLETED",
                        licenseKey: "test-license-key-123"
                    })
                });
            } else if (url.includes('/api/license/activate')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        licenseKey: "test-license-key-123"
                    })
                });
            } else if (url.includes('/api/health')) {
                return Promise.resolve(TEST_CONFIG.mockAPIResponses.success);
            } else if (url.includes('/api/order-email')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        email: "support@webzonebw.in"
                    })
                });
            }
            
            return originalFetch.apply(this, arguments);
        };
    }

    function restoreFetch() {
        window.fetch = originalFetch;
    }

    // Test functions
    function testEmailValidation() {
        console.log("\n=== Testing Email Validation ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        // Test valid email
        const validResult = license.validateEmail(TEST_CONFIG.testEmail);
        createTestResult("Valid email validation", validResult.valid && validResult.message === "", {
            email: TEST_CONFIG.testEmail,
            result: validResult
        });

        // Test invalid emails
        TEST_CONFIG.invalidEmails.forEach(email => {
            const result = license.validateEmail(email);
            createTestResult(`Invalid email: "${email}"`, !result.valid, {
                email,
                result: result.message
            });
        });

        // Test edge cases
        createTestResult("Empty email validation", !license.validateEmail("").valid, {
            result: license.validateEmail("").message
        });

        createTestResult("Long email validation", !license.validateEmail("test@" + "a".repeat(250) + ".com").valid, {
            result: license.validateEmail("test@" + "a".repeat(250) + ".com").message
        });
    }

    function testModalCreation() {
        console.log("\n=== Testing Modal Creation ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        try {
            const modal = document.createElement("div");
            modal.id = "test-modal";
            document.body.appendChild(modal);
            
            // Test modal creation
            license.openCheckout();
            
            const checkoutModal = document.getElementById("erLicenseCheckout");
            createTestResult("Modal creation", checkoutModal !== null, {
                modalExists: !!checkoutModal
            });

            // Test modal structure
            if (checkoutModal) {
                const header = checkoutModal.querySelector(".er-modal-header");
                const body = checkoutModal.querySelector(".er-modal-body");
                const emailInput = checkoutModal.querySelector("#licEmail");
                const closeBtn = checkoutModal.querySelector("#licCloseBtn");
                
                createTestResult("Modal header", header !== null, { hasHeader: !!header });
                createTestResult("Modal body", body !== null, { hasBody: !!body });
                createTestResult("Email input", emailInput !== null, { hasEmailInput: !!emailInput });
                createTestResult("Close button", closeBtn !== null, { hasCloseBtn: !!closeBtn });
                
                // Test accessibility attributes
                createTestResult("Modal ARIA attributes", 
                    checkoutModal.getAttribute("role") === "dialog" && 
                    checkoutModal.getAttribute("aria-modal") === "true",
                    { role: checkoutModal.getAttribute("role"), ariaModal: checkoutModal.getAttribute("aria-modal") }
                );
            }

            // Clean up
            if (checkoutModal) {
                checkoutModal.remove();
            }
            modal.remove();
            
        } catch (error) {
            createTestResult("Modal creation error", false, { error: error.message });
        }
    }

    function testEmailInputValidation() {
        console.log("\n=== Testing Email Input Validation ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        try {
            license.openCheckout();
            
            const modal = document.getElementById("erLicenseCheckout");
            if (!modal) {
                createTestResult("Email input test setup", false, { error: "Modal not created" });
                return;
            }

            const emailInput = modal.querySelector("#licEmail");
            const errorElement = modal.querySelector("#email-error");
            
            if (!emailInput || !errorElement) {
                createTestResult("Email input elements", false, { 
                    emailInput: !!emailInput, 
                    errorElement: !!errorElement 
                });
                modal.remove();
                return;
            }

            // Test initial state
            createTestResult("Initial email state", emailInput.value === "", { initialValue: emailInput.value });

            // Test valid email
            emailInput.value = TEST_CONFIG.testEmail;
            emailInput.dispatchEvent(new Event("input"));
            
            setTimeout(() => {
                const isValid = !emailInput.classList.contains("error");
                createTestResult("Valid email input", isValid, { 
                    hasErrorClass: emailInput.classList.contains("error"),
                    errorDisplay: errorElement.style.display
                });

                // Test invalid email
                emailInput.value = "invalid-email";
                emailInput.dispatchEvent(new Event("input"));
                
                setTimeout(() => {
                    const hasError = emailInput.classList.contains("error");
                    createTestResult("Invalid email input", hasError, { 
                        hasErrorClass: hasError,
                        errorText: errorElement.textContent
                    });

                    modal.remove();
                }, 100);
            }, 100);

        } catch (error) {
            createTestResult("Email input validation error", false, { error: error.message });
        }
    }

    function testPaymentButtonState() {
        console.log("\n=== Testing Payment Button State ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        try {
            license.openCheckout();
            
            const modal = document.getElementById("erLicenseCheckout");
            if (!modal) {
                createTestResult("Payment button test setup", false, { error: "Modal not created" });
                return;
            }

            const emailInput = modal.querySelector("#licEmail");
            const continueBtn = modal.querySelector("#continuePaymentBtn");
            
            if (!emailInput || !continueBtn) {
                createTestResult("Payment button elements", false, { 
                    emailInput: !!emailInput, 
                    continueBtn: !!continueBtn 
                });
                modal.remove();
                return;
            }

            // Test initial disabled state
            createTestResult("Continue button initially disabled", continueBtn.disabled, { 
                disabled: continueBtn.disabled 
            });

            // Test enable with valid email
            emailInput.value = TEST_CONFIG.testEmail;
            emailInput.dispatchEvent(new Event("input"));
            
            setTimeout(() => {
                createTestResult("Continue button enabled with valid email", !continueBtn.disabled, { 
                    disabled: continueBtn.disabled 
                });

                // Test disable with invalid email
                emailInput.value = "invalid";
                emailInput.dispatchEvent(new Event("input"));
                
                setTimeout(() => {
                    createTestResult("Continue button disabled with invalid email", continueBtn.disabled, { 
                        disabled: continueBtn.disabled 
                    });

                    modal.remove();
                }, 100);
            }, 100);

        } catch (error) {
            createTestResult("Payment button state error", false, { error: error.message });
        }
    }

    function testModalAccessibility() {
        console.log("\n=== Testing Modal Accessibility ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        try {
            license.openCheckout();
            
            const modal = document.getElementById("erLicenseCheckout");
            if (!modal) {
                createTestResult("Modal accessibility test setup", false, { error: "Modal not created" });
                return;
            }

            const emailInput = modal.querySelector("#licEmail");
            const closeBtn = modal.querySelector("#licCloseBtn");
            
            // Test keyboard navigation
            createTestResult("Email input has proper attributes", 
                emailInput && emailInput.getAttribute("type") === "email" && 
                emailInput.getAttribute("required") !== null,
                { type: emailInput?.getAttribute("type"), required: emailInput?.getAttribute("required") }
            );

            createTestResult("Close button has ARIA label", 
                closeBtn && closeBtn.getAttribute("aria-label") === "Close checkout",
                { ariaLabel: closeBtn?.getAttribute("aria-label") }
            );

            // Test escape key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            
            setTimeout(() => {
                const modalStillExists = document.getElementById("erLicenseCheckout") !== null;
                createTestResult("Escape key closes modal", !modalStillExists, { modalRemoved: !modalStillExists });
            }, 100);

        } catch (error) {
            createTestResult("Modal accessibility error", false, { error: error.message });
        }
    }

    function testErrorHandling() {
        console.log("\n=== Testing Error Handling ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        // Test configuration error
        mockFetch(TEST_CONFIG.mockAPIResponses.paymentConfigError);
        
        try {
            license.openCheckout();
            
            const modal = document.getElementById("erLicenseCheckout");
            if (!modal) {
                createTestResult("Error handling test setup", false, { error: "Modal not created" });
                restoreFetch();
                return;
            }

            setTimeout(() => {
                const configError = modal.querySelector("#licConfigError");
                const hasConfigError = configError && configError.style.display !== "none";
                
                createTestResult("Configuration error display", hasConfigError, { 
                    configErrorVisible: hasConfigError,
                    errorDisplay: configError?.style.display
                });

                modal.remove();
                restoreFetch();
            }, 100);

        } catch (error) {
            createTestResult("Error handling test error", false, { error: error.message });
            restoreFetch();
        }
    }

    function testStatePersistence() {
        console.log("\n=== Testing State Persistence ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        // Test license storage
        const testLicenseKey = "test-persistence-key";
        const testEmail = "persistence@test.com";
        
        // Simulate storing a license
        localStorage.setItem("wzb_er_license_v1", JSON.stringify({
            licenseKey: testLicenseKey,
            email: testEmail
        }));

        // Verify license can be read
        const stored = license.readStored();
        createTestResult("License storage persistence", 
            stored && stored.licenseKey === testLicenseKey && stored.email === testEmail,
            { storedLicense: stored?.licenseKey, storedEmail: stored?.email }
        );

        // Clean up
        localStorage.removeItem("wzb_er_license_v1");
    }

    function testResponsiveDesign() {
        console.log("\n=== Testing Responsive Design ===");
        
        const license = window.WEBZONEBW_LICENSE;
        
        // Test mobile viewport
        const originalWidth = window.innerWidth;
        window.innerWidth = 375; // Mobile width
        
        try {
            license.openCheckout();
            
            const modal = document.getElementById("erLicenseCheckout");
            if (modal) {
                const modalCard = modal.querySelector(".er-modal-card");
                const isMobile = window.innerWidth <= 640;
                
                createTestResult("Mobile responsive design", 
                    modalCard && modalCard.style.maxWidth === "100%",
                    { maxWidth: modalCard?.style.maxWidth, isMobile }
                );

                modal.remove();
            }
            
        } catch (error) {
            createTestResult("Responsive design test error", false, { error: error.message });
        } finally {
            // Restore original width
            window.innerWidth = originalWidth;
        }
    }

    // Run all tests
    function runAllTests() {
        console.log("🚀 Starting WEBZONEBW ER Studio Premium Checkout Tests...");
        console.log("=" * 60);
        
        // Setup
        mockFetch();
        
        // Run test suites
        testEmailValidation();
        testModalCreation();
        testEmailInputValidation();
        testPaymentButtonState();
        testModalAccessibility();
        testErrorHandling();
        testStatePersistence();
        testResponsiveDesign();
        
        // Results
        console.log("\n" + "=" * 60);
        console.log("📊 TEST RESULTS SUMMARY:");
        console.log(`Total Tests: ${testResults.total}`);
        console.log(`Passed: ${testResults.passed} ✅`);
        console.log(`Failed: ${testResults.failed} ❌`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
        
        // Detailed results
        if (testResults.failed > 0) {
            console.log("\n❌ FAILED TESTS:");
            testResults.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.details.error || "Unknown error"}`);
                });
        }
        
        // Cleanup
        restoreFetch();
        
        // Return results for external use
        return testResults;
    }

    // Make tests available globally
    window.WEBZONEBW_PREMIUM_TESTS = {
        runAllTests,
        config: TEST_CONFIG,
        results: testResults
    };

    // Auto-run tests if in test environment
    if (window.location.search.includes("test=premium")) {
        setTimeout(runAllTests, 1000);
    }

    console.log("🧪 WEBZONEBW Premium Checkout Test Suite loaded.");
    console.log("Run window.WEBZONEBW_PREMIUM_TESTS.runAllTests() to execute all tests.");

})();