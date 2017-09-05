/*
 * jQuery Dropdown: A simple dropdown plugin
 *
 * Contribute: https://github.com/claviska/jquery-dropdown
 *
 * @license: MIT license: http://opensource.org/licenses/MIT
 *
 */
if (jQuery) (function ($) {

    $.extend($.fn, {
        jqDropdown: function (method, data) {

            switch (method) {
                case 'show':
                    show(null, $(this));
                    return $(this);
                case 'hide':
                    hide();
                    return $(this);
                case 'attach':
                    return $(this).attr('data-jq-dropdown', data);
                case 'detach':
                    hide();
                    return $(this).removeAttr('data-jq-dropdown');
                case 'disable':
                    return $(this).addClass('jq-dropdown-disabled');
                case 'enable':
                    hide();
                    return $(this).removeClass('jq-dropdown-disabled');
            }

        }
    });

    function show(event, object) {

        var trigger = event ? $(this) : object,
            jqDropdown = $(trigger.attr('data-jq-dropdown')),
            isOpen = trigger.hasClass('jq-dropdown-open');

        // In some cases we don't want to show it
        if (event) {
            if ($(event.target).hasClass('jq-dropdown-ignore')) return;

            event.preventDefault();
            event.stopPropagation();
        } else {
            if (trigger !== object.target && $(object.target).hasClass('jq-dropdown-ignore')) return;
        }
        hide(event);

        if (isOpen || trigger.hasClass('jq-dropdown-disabled')) return;

        jqDropdown.data('jq-dropdown-trigger', trigger)

        // Show and position it
        position(jqDropdown);

        // Trigger the show callback
        jqDropdown
            .triggerHandler('show', {
                jqDropdown: jqDropdown,
                trigger: trigger
            });

    }

    function hide(event) {

        // In some cases we don't hide them
        var targetGroup = event ? $(event.target).parents().addBack() : null;

        // hide other dropdowns, but not the one we've clicked within
        var toHide = $(document).find('.jq-dropdown:visible').not(
            $(event.target).parents('.jq-dropdown'));

        if (targetGroup && targetGroup.is('.jq-dropdown') &&
            targetGroup.is('.jq-dropdown-menu') &&
            targetGroup.is('A')) {
            // Clicked an option within the current dropdown
            // If this is a nested dropdown, make sure to keep the parent dropdown open
            toHide = $(event.target).closest('.jq-dropdown:visible')
        }

        // Trigger the event early, so that it might be prevented on the visible popups
        var hideEvent = jQuery.Event("hide");


        toHide.each(function () {
            var jqDropdown = $(this);
            jqDropdown
                .hide()
                .triggerHandler('hide', { jqDropdown: jqDropdown });
        });

        if(!hideEvent.isDefaultPrevented()) {
            // Hide any jq-dropdown that may be showing
            toHide.each(function () {
                // Remove all jq-dropdown-open classes
                var jqDropdown = $(this);
                var trigger = jqDropdown.data('jq-dropdown-trigger');
                trigger.removeClass('jq-dropdown-open');
                jqDropdown
                    .hide()
                    .removeData('jq-dropdown-trigger')
                    .triggerHandler('hide', { jqDropdown: jqDropdown });
            });
        }
    }

    function window_resize() {
        $('.jq-dropdown:visible').each(function() {
            var jqDropdown = $(this);
            jqDropdown.hide(); // we need to be able to get a clean doc_height
            position(jqDropdown);
        });
    }

    function position(jqDropdown) {

        var trigger = jqDropdown.data('jq-dropdown-trigger'),
            hOffset = parseInt(trigger.attr('data-horizontal-offset') || 0, 10),
            vOffset = parseInt(trigger.attr('data-vertical-offset') || 0, 10);

        if (!trigger) return;

        // Record dimensions before it is shown
        var doc_height = jQuery(document).height();

        // Reset adjustments so we get a proper idea of ideal dimensions
        jqDropdown.children('.jq-dropdown-panel, .jq-dropdown-menu').css(
            {'margin-left': 0, 'margin-right': 0}
        )
        jqDropdown
            .css({'top': 'auto', 'left': 'auto', 'right': 'auto', 'bottom': 'auto'})

        // Show it
        trigger.addClass('jq-dropdown-open');
        jqDropdown.show();

        var pos = {};
        var dropdownViewportLeft = 0;
        // Position the jq-dropdown relative-to-parent...
        if (jqDropdown.hasClass('jq-dropdown-relative')) {
            pos['left'] = jqDropdown.hasClass('jq-dropdown-anchor-right') ?
                trigger.position().left - (jqDropdown.outerWidth(true) - trigger.outerWidth(true)) - parseInt(trigger.css('margin-right'), 10) + hOffset :
                trigger.position().left + parseInt(trigger.css('margin-left'), 10) + hOffset;
            if (jqDropdown.hasClass('jq-dropdown-above')) {
                pos['bottom'] = trigger.parent('.jq-dropdown-container').outerHeight(true) - trigger.position().top - parseInt(trigger.css('margin-top'), 10) - vOffset;
            } else {
                pos['top'] = trigger.position().top + trigger.outerHeight(true) - parseInt(trigger.css('margin-top'), 10) + vOffset;
            }
            dropdownViewportLeft = jqDropdown.hasClass('jq-dropdown-anchor-right') ?
                trigger.offset().left - (jqDropdown.outerWidth(true) - trigger.outerWidth(true)) + hOffset :
                trigger.offset().left + hOffset;
        } else {
            // ...or relative to document
            pos['left'] = jqDropdown.hasClass('jq-dropdown-anchor-right') ?
                trigger.offset().left - (jqDropdown.outerWidth() - trigger.outerWidth()) + hOffset : trigger.offset().left + hOffset;
            if (jqDropdown.hasClass('jq-dropdown-above')) {
                pos['bottom'] = doc_height - trigger.offset().top - vOffset;
            } else {
                pos['top'] = trigger.offset().top + trigger.outerHeight() + vOffset;
            }
            dropdownViewportLeft = pos['left'];
        }
        if (jqDropdown.hasClass('jq-dropdown-anchor-right')) {
            if (dropdownViewportLeft < 0) {
                pos['left'] = 0;
                // the following only moves the right-anchored dropdown-tip
                jqDropdown.children('.jq-dropdown-panel, .jq-dropdown-menu').css(
                    {'margin-right':  Math.floor(dropdownViewportLeft) }
                )
            }
        } else {
            if (dropdownViewportLeft + jqDropdown.outerWidth() > jQuery(window).width()) {
                // only apply to child panel/menu to keep the dropdown-tip in the right place
                jqDropdown.children('.jq-dropdown-panel, .jq-dropdown-menu').css(
                    {'margin-left':  Math.floor(-((dropdownViewportLeft + jqDropdown.outerWidth()) - jQuery(window).width())) }
                )
            }
        }
        for (pos_attr in pos) {
            pos[pos_attr] = Math.round(pos[pos_attr]);
        }
        jqDropdown.css(pos);
    }

    $(document).on('click.jq-dropdown', '[data-jq-dropdown]', show);
    $(document).on('click.jq-dropdown', hide);
    $(window).on('resize', window_resize);

})(jQuery);
