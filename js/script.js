'use strict';

function setupResourceSearch($) {
    const $input = $('#resource-search');
    if (!$input.length) return;

    const $box = $('#resource-search-box');
    const $cards = $('#resource-cards');
    const $suggestions = $('#resource-suggestions');
    const $empty = $('#resource-no-results');

    // Wrap literal matches without treating search input or card content as HTML.
    function highlightMatches(element, pattern) {
        const parts = $(element).text().split(pattern);
        $(element).empty();
        parts.forEach((part, index) => {
            const node = index % 2 ? $('<mark>').text(part)[0] : document.createTextNode(part);
            $(element).append(node);
        });
    }

    function updateSearch(showSuggestions) {
        const query = $input.val().trim();
        const term = query.toLowerCase();
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = query ? new RegExp('(' + escaped + ')', 'gi') : null;
        const $results = $cards.find('.resource-card').filter(function () {
            const $fields = $(this).find('.card-title, .card-text');
            const matches = $fields.toArray().some(field => field.textContent.toLowerCase().includes(term));
            $(this).parent().prop('hidden', !matches);
            $fields.each(function () {
                if (matches && pattern) highlightMatches(this, pattern);
                else $(this).text($(this).text());
            });
            return matches;
        });

        $('#resource-count').text($results.length + ($results.length === 1 ? ' campus resource' : ' campus resources'));
        $empty.prop('hidden', $results.length !== 0);
        $suggestions.empty();
        if (showSuggestions && query) {
            $results.find('.card-title').each(function () {
                $('<button>', { type: 'button', class: 'list-group-item list-group-item-action' })
                    .text($(this).text()).appendTo($suggestions);
            });
        }
        $suggestions.prop('hidden', !$suggestions.children().length);
    }

    $input.on('input', () => updateSearch(true));
    $input.on('keydown', function (event) {
        const $first = $suggestions.find('button').first();
        if (event.key === 'ArrowDown' && !$suggestions.prop('hidden')) {
            event.preventDefault();
            $first.trigger('focus');
        }
        if (event.key === 'Enter' && !$suggestions.prop('hidden')) {
            event.preventDefault();
            $first.trigger('click');
        }
    });
    $suggestions.on('click', 'button', function () {
        $input.val($(this).text()).trigger('focus');
        updateSearch(false);
    });
    $box.on('keydown', function (event) {
        if (event.key !== 'Escape' || $suggestions.prop('hidden')) return;
        event.preventDefault();
        $suggestions.prop('hidden', true);
        $input.trigger('focus');
    });
    $(document).on('click', function (event) {
        if (!$box[0].contains(event.target)) $suggestions.prop('hidden', true);
    });
    $cards.on('catalog-rendered', () => updateSearch(false));
    $cards.on('catalog-reveal', () => $input.val(''));
    $box.prop('hidden', false);
    updateSearch(false);
}

function setupReadingProgress($) {
    const $progress = $('#reading-progress');
    function updateProgress() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const percent = scrollable > 0 ? Math.min(100, Math.max(0, $(window).scrollTop() / scrollable * 100)) : 0;
        $progress.attr('aria-valuenow', Math.round(percent));
        $progress.find('.reading-progress-fill').css('width', percent + '%');
    }
    $progress.prop('hidden', false);
    $(window).on('scroll resize load', updateProgress);
    if (window.ResizeObserver) new ResizeObserver(updateProgress).observe(document.body);
    updateProgress();
}

function setupAnimatedCounters($, reduceMotion) {
    $('[data-count-to]').each(function () {
        const $counter = $(this);
        const target = Number($counter.attr('data-count-to'));
        if (reduceMotion) return;
        $counter.text(0);
        $({ value: 0 }).animate({ value: target }, {
            duration: 900,
            step(value) { $counter.text(Math.floor(value)); },
            complete() { $counter.text(target); }
        });
    });
}

function setupFormFeedback($, reduceMotion) {
    const $form = $('#contact-form');
    if (!$form.length) return;
    const $submit = $('#wizard-submit');
    const $status = $('#form-status');
    const $toast = $('#campus-toast');
    let submitTimer;

    function restoreButton() {
        if (!submitTimer) return;
        window.clearTimeout(submitTimer);
        submitTimer = undefined;
        $submit.prop('disabled', false).removeAttr('aria-busy').text('Check message');
    }

    function showToast() {
        $toast.stop(true, true).hide().prop('hidden', false)
            .text('Demo form checked successfully.')
            .fadeIn(reduceMotion ? 0 : 180)
            .delay(3200)
            .fadeOut(reduceMotion ? 0 : 400, function () {
                $(this).prop('hidden', true);
            });
    }

    $form.on('validation-success', function (event) {
        if (submitTimer) return;
        const message = event.originalEvent.detail.message;
        $status.text('').removeClass('alert alert-success');
        $submit.prop('disabled', true).attr('aria-busy', 'true').empty()
            .append($('<span>', { class: 'spinner-border spinner-border-sm me-2', 'aria-hidden': 'true' }))
            .append('Please wait…');

        submitTimer = window.setTimeout(function () {
            restoreButton();
            $status.text(message).addClass('alert alert-success');
            showToast();
        }, 1000);
    });
    $form.on('input change reset', restoreButton);
    $('#wizard-back').on('click', restoreButton);
}

function setupCopyButtons($) {
    $('.copy-email').each(function () {
        const $button = $(this);
        const email = $button.closest('td').find('a[href^="mailto:"]').text().trim();
        const $feedback = $button.siblings('.copy-feedback');
        let feedbackTimer;
        $button.attr('aria-label', 'Copy ' + email).prop('hidden', false);

        $button.on('click', async function () {
            window.clearTimeout(feedbackTimer);
            $button.prop('disabled', true);
            try {
                await navigator.clipboard.writeText(email);
                $button.text('✓').attr('aria-label', 'Copied ' + email);
                $feedback.text('Copied to clipboard!');
            } catch {
                $button.text('Copy');
                $feedback.text('Could not copy. Select the email to copy it.');
            } finally {
                $button.prop('disabled', false);
                $feedback.prop('hidden', false);
            }
            feedbackTimer = window.setTimeout(function () {
                $button.text('Copy').attr('aria-label', 'Copy ' + email);
                $feedback.prop('hidden', true);
            }, 2400);
        });
    });
}

function setupLazyGallery($) {
    const $images = $('#campusCarousel img[data-lazy-src]');
    function loadImage(image) {
        const $image = $(image);
        $image.attr('src', $image.attr('data-lazy-src')).removeAttr('data-lazy-src');
    }

    if (!window.IntersectionObserver) {
        $images.each(function () {
            $(this).attr('loading', 'lazy');
            loadImage(this);
        });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            loadImage(entry.target);
            observer.unobserve(entry.target);
        });
    });
    $images.each(function () { observer.observe(this); });
}

function startAssignment6($) {
    $(document).ready(function () {
        console.log('jQuery is ready!');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setupResourceSearch($);
        setupReadingProgress($);
        setupAnimatedCounters($, reduceMotion);
        setupFormFeedback($, reduceMotion);
        setupCopyButtons($);
        setupLazyGallery($);
    });
}

if (window.jQuery) {
    startAssignment6(window.jQuery);
} else {
    // Use the same library from the ZIP when the CDN is unavailable.
    const localJQuery = document.createElement('script');
    localJQuery.src = 'vendor/jquery/jquery-4.0.0.min.js';
    localJQuery.onload = () => startAssignment6(window.jQuery);
    document.head.append(localJQuery);
}
