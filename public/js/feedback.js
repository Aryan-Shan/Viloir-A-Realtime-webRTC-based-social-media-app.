// Author- Aryan Shandilya
document.addEventListener("DOMContentLoaded", () => {
    const feedbackForm = document.getElementById("feedbackForm");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const emailError = document.getElementById("emailError");
    const messageError = document.getElementById("messageError");
    const formStatus = document.getElementById("formStatus");

    // Email validation regex
    const emailRegex = /^[a-z]+\.[0-9]{2}[A-Za-z]{3}[0-9]{5}@vitbhopal\.ac\.in$/;

    // Form submission handler
    feedbackForm.addEventListener("submit", (event) => {
        let isValid = true;

        // Validate email
        if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = "Invalid email format. Please use your VIT Bhopal email (e.g., ajnabee.23abc12345@vitbhopal.ac.in).";
            isValid = false;
        } else {
            emailError.textContent = "";
        }

        // Validate message length (max 200 words)
        const messageWords = messageInput.value.trim().split(/\s+/);
        if (messageWords.length > 200) {
            messageError.textContent = "Your message exceeds 200 words. Please shorten your feedback.";
            isValid = false;
        } else {
            messageError.textContent = "";
        }

        // Prevent form submission if validation fails
        if (!isValid) {
            event.preventDefault();
            formStatus.textContent = "Please correct the errors above before submitting.";
        } else {
            formStatus.textContent = "";
        }
    });
});
