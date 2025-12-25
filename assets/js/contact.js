$(document).ready(function(){
    
    (function($) {
        "use strict";

    
    jQuery.validator.addMethod('answercheck', function (value, element) {
        return this.optional(element) || /^\bcat\b$/.test(value)
    }, "type the correct answer -_-");

    // validate contactForm form
    $(function() {
        $('#contactForm').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                email: {
                    required: true,
                    email: true
                },
                number: {
                    minlength: 5
                },
                message: {
                    required: true,
                    minlength: 10
                }
            },
            messages: {
                name: {
                    required: "Please enter your name",
                    minlength: "Your name must be at least 2 characters"
                },
                email: {
                    required: "Please enter your email address",
                    email: "Please enter a valid email address"
                },
                number: {
                    minlength: "Phone number must be at least 5 characters"
                },
                message: {
                    required: "Please enter your message",
                    minlength: "Message must be at least 10 characters"
                }
            },
            submitHandler: function(form) {
                $(form).ajaxSubmit({
                    type:"POST",
                    data: $(form).serialize(),
                    url:"contact_process.php",
                    beforeSend: function() {
                        $('.submit-btn').html('Sending...').prop('disabled', true);
                    },
                    success: function(data, status, xhr) {
                        // Check if response is 'OK' or contains success indicator
                        if (data.trim() === 'OK') {
                            // Reset form and show success message
                            $('#contactForm')[0].reset();
                            $('.submit-btn').html('Request a Quote').prop('disabled', false);
                            $('.modal').modal('hide');
                            $('#success').modal('show');
                        } else {
                            // Show error if response is not OK
                            $('.submit-btn').html('Request a Quote').prop('disabled', false);
                            $('.modal').modal('hide');
                            $('#error').modal('show');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('Form submission error:', xhr.responseText);
                        $('.submit-btn').html('Request a Quote').prop('disabled', false);
                        $('.modal').modal('hide');
                        $('#error').modal('show');
                    }
                })
            }
        })
    })
        
 })(jQuery)
})