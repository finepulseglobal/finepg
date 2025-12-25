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
                subject: {
                    required: true,
                    minlength: 4
                },
                number: {
                    required: true,
                    minlength: 5
                },
                email: {
                    required: true,
                    email: true
                },
                message: {
                    required: true,
                    minlength: 20
                }
            },
            messages: {
                name: {
                    required: "come on, you have a name, don't you?",
                    minlength: "your name must consist of at least 2 characters"
                },
                subject: {
                    required: "come on, you have a subject, don't you?",
                    minlength: "your subject must consist of at least 4 characters"
                },
                number: {
                    required: "come on, you have a number, don't you?",
                    minlength: "your Number must consist of at least 5 characters"
                },
                email: {
                    required: "no email, no message"
                },
                message: {
                    required: "um...yea, you have to write something to send this form.",
                    minlength: "thats all? really?"
                }
            },
            submitHandler: function(form) {
                // Build WhatsApp message and open chat in new tab (keeps existing AJAX submission)
                try {
                    var $f = $(form);
                    var waLines = [];
                    var vals = {
                        'Name': $f.find('input[name="name"]').val() || '',
                        'Email': $f.find('input[name="email"]').val() || '',
                        'Contact Number': $f.find('input[name="number"]').val() || '',
                        'Service': $f.find('select[name="subject"]').val() || '',
                        'Departure': $f.find('input[name="departure"]').val() || '',
                        'Arrival': $f.find('input[name="arrival"]').val() || '',
                        'KG/CBM': $f.find('input[name="weight"]').val() || '',
                        'Message': $f.find('textarea[name="message"]').val() || ''
                    };
                    for (var k in vals) {
                        if (Object.prototype.hasOwnProperty.call(vals, k) && vals[k]) {
                            waLines.push(k + ': ' + vals[k]);
                        }
                    }
                    var waText = waLines.join('\n');
                    var waNumber = '8613411179135'; // existing WhatsApp contact
                    var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);
                    window.open(waUrl, '_blank');
                } catch (e) {
                    console.warn('WhatsApp prefill failed', e);
                }

                $(form).ajaxSubmit({
                    type:"POST",
                    data: $(form).serialize(),
                    url:"contact_process.php",
                    success: function() {
                        $('#contactForm :input').attr('disabled', 'disabled');
                        $('#contactForm').fadeTo( "slow", 1, function() {
                            $(this).find(':input').attr('disabled', 'disabled');
                            $(this).find('label').css('cursor','default');
                            $('#success').fadeIn()
                            $('.modal').modal('hide');
		                	$('#success').modal('show');
                        })
                    },
                    error: function() {
                        $('#contactForm').fadeTo( "slow", 1, function() {
                            $('#error').fadeIn()
                            $('.modal').modal('hide');
		                	$('#error').modal('show');
                        })
                    }
                })
            }
        })
    })
        
 })(jQuery)
})