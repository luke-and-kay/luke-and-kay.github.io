document.addEventListener('DOMContentLoaded', () => {
    const wave = document.querySelector('.wave-container');
    const waveUnderlay = document.querySelector('.wave-underlay');
    const waterContent = document.getElementById('waterContent');
    const underlayTitle = document.getElementById('underlayTitle');
    const underlayContent = document.getElementById('underlayContent');
    const underlayClose = document.getElementById('underlayClose');
    const underlayPanelBody = document.querySelector('.underlay-panel-body');
    let isPanelAnimating = false;
    let activeRsvpRequestId = 0;
    const links = Array.from(document.querySelectorAll('.logout-link'));
    const menu = document.getElementById('logoutMenu');
    const toggle = document.getElementById('logoutToggle');
    const wrapper = document.querySelector('.transition-wrapper');

    if (!wave || !waterContent || links.length === 0) {
        return;
    }

    links.forEach(link => {
        // Allow external links (e.g., registry) to open normally.
        if (link.target === '_blank') {
            return;
        }

        link.addEventListener('click', (event) => {
            event.preventDefault();
            const text = link.textContent?.trim() || 'Link';
            setUnderlayContent(text);
            openWater();
            closeNavMenu(menu, toggle);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeWater(wave, waterContent, wrapper, waveUnderlay);
        }
    });

    if (underlayClose) {
        underlayClose.addEventListener('click', () => {
            closeWater(wave, waterContent, wrapper, waveUnderlay);
        });
    }

    function openWater() {
        wave.classList.add('water-open');
        if (waveUnderlay) {
            waveUnderlay.classList.add('water-open');
        }
        waterContent.setAttribute('aria-hidden', 'false');
        if (wrapper) {
            wrapper.classList.add('water-open');
        }
        waterContent.focus({ preventScroll: true });
    }

    function setUnderlayContent(text) {
        if (!underlayTitle || !underlayContent || !underlayPanelBody) {
            return;
        }

        const currentText = (underlayTitle.textContent || '').trim();
        const isInitialFill = currentText === '';

        if (isInitialFill) {
            applyContent(text);
            return;
        }

        if (currentText === text || isPanelAnimating) {
            return;
        }

        isPanelAnimating = true;
        underlayPanelBody.classList.add('slide-out-left');

        const finishSlideOut = () => {
            underlayPanelBody.classList.remove('slide-out-left');
            applyContent(text);
            underlayPanelBody.classList.add('prep-in');

            requestAnimationFrame(() => {
                // force layout so prep-in start position is applied before animating back to center
                underlayPanelBody.getBoundingClientRect();
                underlayPanelBody.classList.remove('prep-in');
                const handleSlideInEnd = (evt) => {
                    if (evt.target !== underlayPanelBody || evt.propertyName !== 'transform') {
                        return;
                    }
                    underlayPanelBody.removeEventListener('transitionend', handleSlideInEnd);
                    isPanelAnimating = false;
                };
                underlayPanelBody.addEventListener('transitionend', handleSlideInEnd, { once: true });

                // Fallback in case transitionend does not fire
                setTimeout(() => {
                    if (isPanelAnimating) {
                        isPanelAnimating = false;
                    }
                }, 700);
            });
        };

        const handleSlideOutEnd = (event) => {
            if (event.target !== underlayPanelBody || event.propertyName !== 'transform') {
                return;
            }
            underlayPanelBody.removeEventListener('transitionend', handleSlideOutEnd);
            finishSlideOut();
        };

        underlayPanelBody.addEventListener('transitionend', handleSlideOutEnd);
        // Fallback if transitionend doesn't fire (e.g., element not yet visible)
        setTimeout(() => {
            if (isPanelAnimating && underlayPanelBody.classList.contains('slide-out-left')) {
                underlayPanelBody.removeEventListener('transitionend', handleSlideOutEnd);
                finishSlideOut();
            }
        }, 400);
    }

    function applyContent(text) {
        underlayTitle.textContent = text;
        if (text.toLowerCase() === 'rsvp') {
            loadRsvpContent();
            return;
        }
        if (text.toLowerCase() === 'schedule') {
            renderScheduleContent();
            return;
        }
        if (text.toLowerCase() === 'faqs') {
            renderFaqContent();
            return;
        }

        underlayContent.textContent = text;
    }

    function renderScheduleContent() {
        if (!underlayContent) {
            return;
        }

        underlayContent.innerHTML = `
            <div class="schedule-panel">
                <ol class="schedule-timeline">
                    <li class="schedule-item">
                        <div class="schedule-time">14:15</div>
                        <div class="schedule-body">
                            <p class="schedule-heading">Ceremony</p>
                            <a class="schedule-link" href="https://maps.google.com/?q=Bristol%20Register%20Office" target="_blank" rel="noopener">Bristol Register Office</a>
                            <p class="schedule-text">Please arrive promptly to be seated by 14:30</p>
                        </div>
                    </li>
                    <li class="schedule-item">
                        <div class="schedule-time">15:15</div>
                        <div class="schedule-body">
                            <p class="schedule-heading">Cocktail Parade</p>
                            <p class="schedule-text">Leaving from <a class="schedule-link" href="https://maps.google.com/?q=Bristol%20Register%20Office" target="_blank" rel="noopener">Bristol Register Office</a></p>
                            <p class="schedule-text">Led by New Orleans brass band <a href="https://headrushbrassband.com">Head Rush</a></p>
                        </div>
                    </li>
                    <li class="schedule-item">
                        <div class="schedule-time">15:45</div>
                        <div class="schedule-body">
                            <p class="schedule-heading">Harbour Cruise</p>
                            <p class="schedule-text">Departing from <a class="schedule-link" href="https://maps.app.goo.gl/XmeXfENA1zp47vE88" target="_blank" rel="noopener">Castle Park Landing</a></p>
                            <p class="schedule-text">Drinks, snacks, and a scenic cruise along the River Avon</p>
                        </div>
                    </li>
                    <li class="schedule-item">
                        <div class="schedule-time">18:00</div>
                        <div class="schedule-body">
                            <p class="schedule-heading">Wedding Breakfast</p>
                            <p class="schedule-text">Docking at <a class="schedule-link" href="https://maps.app.goo.gl/w7dXcijqcsYg6aJT9" target="_blank" rel="noopener">Riverstation</a></p>
                            <p class="schedule-text">A three-course meal to celebrate the newlyweds</p>
                        </div>
                    </li>
                    <li class="schedule-item">
                        <div class="schedule-time">20:00</div>
                        <div class="schedule-body">
                            <p class="schedule-heading">Evening</p>
                            <a class="schedule-link" href="https://maps.app.goo.gl/w7dXcijqcsYg6aJT9" target="_blank" rel="noopener">Riverstation</a>
                            <p class="schedule-text">The celebration continues with dancing and drinks</p>
                        </div>
                    </li>
                </ol>
            </div>
        `;
    }

    function renderFaqContent() {
        if (!underlayContent) {
            return;
        }

        underlayContent.innerHTML = `
            <div class="faq-panel">
                <div class="faq-item">
                    <p class="faq-question">What time should I arrive?</p>
                    <p class="faq-answer">If you're attending the ceremony, please arrive between 14:15 and 14:30 so you can get settled before we begin.</p>
                    <p class="faq-answer">If you're joining us later in the day, please check the schedule for timings and locations.</p>
                    <p class="faq-answer">Evening guests are welcome from 20:00 — we can't wait to celebrate with you!</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">How do I RSVP?</p>
                    <p class="faq-answer">Please let us know whether you can join us via the RSVP page — it really helps us with our planning.</p>
                    <p class="faq-answer">When you reply, please include any dietary requirements so we can make sure everyone is well catered for.</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">Can I bring a plus one?</p>
                    <p class="faq-answer">Due to limited venue capacity, we're only able to accommodate plus ones during the day if they're named on your invitation.</p>
                    <p class="faq-answer">If you'd like to bring a guest in the evening, they're very welcome to join from 20:00 onwards — just let Luke or Kayleigh know.</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">What date should I RSVP by?</p>
                    <p class="faq-answer">We'd love to hear from you as soon as you can, but please RSVP by April 30th so we can finalise arrangements for our big day.</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">Will the wedding be inside or outside?</p>
                    <p class="faq-answer">The ceremony and evening reception will take place indoors.</p>
                    <p class="faq-answer">However, the cocktail parade and harbour cruise will be outside — so we're hoping for sunshine!</p>
                </div>
                            
                <div class="faq-item">
                    <p class="faq-question">What do I wear?</p>
                    <p class="faq-answer">Please join us in formal attire — we'd love to see everyone dressed their best for the occasion!</p>
                    <p class="faq-answer">Think suits, ties, elegant dresses, and anything glamorous.</p>
                    <p class="faq-answer">As there will be some walking and outdoor elements during the day, we recommend comfortable (but still dressy) shoes and bringing a light layer, just in case the British weather has its own plans.</p>
                    <p class="faq-answer">We also kindly ask that guests avoid wearing white.</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">Do you have a wedding registry?</p>
                    <p class="faq-answer">Yes! We've created a registry with <a href="https://prezola.com/buy/view/273933">Prezola</a> for guests who would like to contribute towards our honeymoon.</p>
                    <p class="faq-answer">Your presence at our wedding truly means more to us than any gift, and anything you give is completely optional.</p>
                </div>

                <div class="faq-item">
                    <p class="faq-question">Can I take photos?</p>
                    <p class="faq-answer">We'd love you to take photos throughout the day and share them with us — we can't wait to see them!</p>
                    <p class="faq-answer">We just ask that no photos are taken during the ceremony, and that images of the bride and groom aren't posted on social media until we've shared our first photo as Mr & Mrs.</p>
                </div>
            </div>

                
                

        `;
    }

    async function loadRsvpContent() {
        if (!underlayContent) {
            return;
        }

        const requestId = Date.now();
        activeRsvpRequestId = requestId;
        showRsvpLoadingState();

        const weddingPin = getWeddingPin();
        if (!weddingPin || typeof db === 'undefined') {
            renderRsvpError('We could not load your invite. Please log in again.');
            return;
        }

        try {
            const partyDoc = await db.collection('users').doc(weddingPin).get();
            if (activeRsvpRequestId !== requestId) {
                return;
            }
            if (!partyDoc.exists) {
                renderRsvpError('We could not find your invite. Please try again.');
                return;
            }

            const partyData = partyDoc.data() || {};
            const guestRefs = Array.isArray(partyData.guests) ? partyData.guests : [];
            const guestSnapshots = await Promise.all(
                guestRefs.map((ref) => ref.get().catch(() => null))
            );

            if (activeRsvpRequestId !== requestId) {
                return;
            }

            const guests = guestSnapshots
                .filter((snap) => snap && snap.exists)
                .map((snap) => ({ id: snap.id, data: snap.data() || {} }));

            renderRsvpForms(guests);
        } catch (error) {
            console.error('Failed to load RSVP content', error);
            if (activeRsvpRequestId === requestId) {
                renderRsvpError('We could not load your invite right now. Please try again.');
            }
        }
    }

    function getWeddingPin() {
        if (typeof auth === 'undefined') {
            return '';
        }

        const user = auth.currentUser;
        if (user?.email) {
            return user.email.split('@')[0];
        }

        return '';
    }

    function formatGuestName(data) {
        const first = (data.first_name || '').trim();
        const last = (data.last_name || '').trim();
        const fullName = `${first} ${last}`.trim();

        if (fullName) {
            return fullName;
        }

        if (first || last) {
            return first || last;
        }

        if (data.email) {
            return data.email;
        }

        return '';
    }

    function renderRsvpForms(guests) {
        if (!underlayContent) {
            return;
        }

        underlayContent.innerHTML = '';

        if (!guests || guests.length === 0) {
            renderRsvpError('We could not find any guests for this invite.');
            return;
        }

        const rsvpQuestions = getRsvpQuestions();
        const formContainer = document.createElement('div');
        formContainer.className = 'rsvp-forms';

        guests.forEach((guest, index) => {
            const data = guest.data || {};
            const guestName = formatGuestName(data);
            const headerLabel = (data.first_name || '').trim() || `Guest ${index + 1}`;
            const attendanceValues = normalizeAttendanceMap(data.attendance);
            const hasSubmitted = data.submitted_form === true;
            const fieldsId = `rsvp-fields-${index}`;

            const form = document.createElement('form');
            form.className = 'underlay-form rsvp-guest-card';
            form.classList.add('collapsed');
            form.setAttribute('aria-label', `RSVP form for ${guestName || `Guest ${index + 1}`}`);

            const header = document.createElement('div');
            header.className = 'rsvp-guest-header';

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'rsvp-guest-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', fieldsId);

            const headerName = document.createElement('span');
            headerName.className = 'rsvp-guest-name';
            headerName.textContent = headerLabel;

            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'rsvp-guest-toggle-icon';
            toggleIcon.textContent = '▾';

            let statusIcon = null;
            if (hasSubmitted) {
                statusIcon = document.createElement('span');
                statusIcon.className = 'rsvp-status-icon submitted';
                statusIcon.textContent = '✓';
                statusIcon.setAttribute('aria-label', 'Submitted');
                statusIcon.setAttribute('title', 'Submitted');
            }

            toggle.appendChild(headerName);
            if (statusIcon) {
                const spacer = document.createElement('span');
                spacer.style.flex = '0 0 1vh';
                toggle.appendChild(spacer);
                toggle.appendChild(statusIcon);
            }
            toggle.appendChild(toggleIcon);

            header.appendChild(toggle);
            form.appendChild(header);

            const fields = document.createElement('div');
            fields.className = 'rsvp-guest-fields';
            fields.id = fieldsId;
            fields.style.maxHeight = '0px';

            const nameSection = document.createElement('div');
            nameSection.className = 'rsvp-section';

            const firstNameInput = buildInputField({
                id: `rsvp-first-name-${index}`,
                name: `first_name-${guest.id || index}`,
                label: 'First Name',
                placeholder: 'First name',
                type: 'text',
                value: (data.first_name || '').trim()
            });
            nameSection.appendChild(firstNameInput.wrapper);

            const lastNameInput = buildInputField({
                id: `rsvp-last-name-${index}`,
                name: `last_name-${guest.id || index}`,
                label: 'Last Name',
                placeholder: 'Last name',
                type: 'text',
                value: (data.last_name || '').trim()
            });
            nameSection.appendChild(lastNameInput.wrapper);

            const emailInput = buildInputField({
                id: `rsvp-email-${index}`,
                name: `email-${guest.id || index}`,
                label: 'Email Address',
                placeholder: 'you@example.com',
                type: 'email',
                value: (data.email || '').trim()
            });
            nameSection.appendChild(emailInput.wrapper);

            const phoneInput = buildInputField({
                id: `rsvp-phone-${index}`,
                name: `phone-${guest.id || index}`,
                label: 'Phone Number',
                placeholder: 'Contact number',
                type: 'tel',
                value: (data.phone_number || '').trim()
            });
            nameSection.appendChild(phoneInput.wrapper);
            fields.appendChild(nameSection);

            const attendanceSection = document.createElement('div');
            attendanceSection.className = 'rsvp-section';
            const attendanceField = buildCheckboxGroup({
                id: `rsvp-attendance-${index}`,
                name: `attendance-${guest.id || index}`,
                legend: 'Attendance',
                options: getOrderedAttendanceKeys(attendanceValues).map((key) => ({
                    value: key,
                    label: formatAttendanceLabel(key)
                })),
                values: attendanceValues
            });
            const attendanceCheckboxes = Array.from(attendanceField.querySelectorAll('input[type="checkbox"]'));
            attendanceSection.appendChild(attendanceField);
            fields.appendChild(attendanceSection);

            const dietarySection = document.createElement('div');
            dietarySection.className = 'rsvp-section rsvp-dietary-group';

            const dietCheckboxes = buildCheckboxGroup({
                id: `rsvp-dietary-options-${index}`,
                name: `dietary-options-${guest.id || index}`,
                legend: 'Dietary requirements',
                options: [
                    { value: 'vegan', label: 'Vegan', checked: !!data.vegan },
                    { value: 'vegetarian', label: 'Vegetarian', checked: !!data.vegetarian },
                ],
                values: {}
            });
            const dietaryCheckboxes = Array.from(dietCheckboxes.querySelectorAll('input[type="checkbox"]'));
            enforceExclusiveCheckboxes(dietaryCheckboxes);

            const dietaryTextField = buildInputField({
                id: `rsvp-dietary-${index}`,
                name: `dietary-${guest.id || index}`,
                label: 'Allergies or other dietary needs? (optional)',
                placeholder: 'e.g. nut allergy, gluten free',
                type: 'text',
                value: buildDietaryText(data)
            });
            dietaryTextField.wrapper.classList.add('rsvp-dietary-text');
            dietCheckboxes.appendChild(dietaryTextField.wrapper);
            dietarySection.appendChild(dietCheckboxes);
            fields.appendChild(dietarySection);

            const questionSection = document.createElement('div');
            questionSection.className = 'rsvp-section';
            const questionCaption = document.createElement('p');
            questionCaption.className = 'rsvp-questions-caption';
            questionCaption.textContent = 'Please answer at least three of the following questions (but preferably all of them!) – your responses will be part of the evening entertainment.';
            questionSection.appendChild(questionCaption);
            const questionInputs = [];
            rsvpQuestions.forEach((question, qIndex) => {
                const questionField = buildInputField({
                    id: `rsvp-question-${qIndex + 1}-${index}`,
                    name: `${question.key}-${guest.id || index}`,
                    label: question.label,
                    placeholder: question.placeholder || 'Your answer',
                    type: 'text',
                    value: (data[question.key] || '').trim()
                });
                questionField.wrapper.classList.add('rsvp-question');
                questionInputs.push({ key: question.key, input: questionField.input });
                questionSection.appendChild(questionField.wrapper);
            });
            fields.appendChild(questionSection);

            const submitButton = document.createElement('button');
            submitButton.type = 'button';
            submitButton.textContent = hasSubmitted ? 'Update RSVP' : 'Submit RSVP';
            submitButton.className = 'rsvp-submit';
            if (hasSubmitted) {
                submitButton.classList.add('submitted');
                form.classList.add('submitted');
            }
            submitButton.addEventListener('click', async () => {
                await saveGuestRsvp({
                    guestId: guest.id,
                    attendanceValues,
                    attendanceCheckboxes,
                    dietaryCheckboxes,
                    dietaryTextInput: dietaryTextField.input,
                    firstNameInput: firstNameInput.input,
                    lastNameInput: lastNameInput.input,
                    emailInput: emailInput.input,
                    phoneInput: phoneInput.input,
                    questionInputs,
                    form,
                    submitButton,
                    statusIcon,
                    header,
                    fields,
                    toggle,
                    warningEl
                });
            });
            fields.appendChild(submitButton);

            const warningEl = document.createElement('p');
            warningEl.className = 'rsvp-warning';
            warningEl.setAttribute('role', 'alert');
            warningEl.textContent = '';
            fields.appendChild(warningEl);

            form.appendChild(fields);

            toggle.addEventListener('click', () => {
                const isCollapsed = form.classList.contains('collapsed');
                setGuestFieldsExpanded(form, fields, toggle, isCollapsed);
            });

            formContainer.appendChild(form);

            // ensure collapsed initial state animates cleanly
            requestAnimationFrame(() => {
                setGuestFieldsExpanded(form, fields, toggle, false);
            });
        });

        underlayContent.appendChild(formContainer);
    }

    function buildDietaryText(data) {
        const dietary = (data.dietary_requirements || '').trim();
        if (dietary) {
            return dietary;
        }
        if (data.vegan) {
            return 'Vegan';
        }
        if (data.vegetarian) {
            return 'Vegetarian';
        }
        return '';
    }

    function buildInputField({ id, name, label, placeholder, type, value }) {
        const wrapper = document.createElement('div');

        const input = document.createElement('input');
        input.id = id;
        input.name = name;
        input.type = type;
        input.placeholder = placeholder;
        if (value) {
            input.value = value;
        }

        const labelEl = buildLabel(label, id);
        wrapper.appendChild(labelEl);
        wrapper.appendChild(input);

        return { wrapper, input };
    }

    function buildSelectField({ id, name, label, options, value }) {
        const wrapper = document.createElement('div');

        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;

        const select = document.createElement('select');
        select.id = id;
        select.name = name;

        options.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            select.appendChild(opt);
        });

        if (typeof value === 'string') {
            select.value = value;
        }

        wrapper.appendChild(labelEl);
        wrapper.appendChild(select);

        return wrapper;
    }

    function buildCheckboxGroup({ id, name, legend, options, values }) {
        const wrapper = document.createElement('fieldset');
        wrapper.className = 'rsvp-checkbox-group';
        wrapper.id = id;

        const legendEl = document.createElement('legend');
        legendEl.textContent = legend;
        wrapper.appendChild(legendEl);

        const list = document.createElement('div');
        list.className = 'rsvp-checkboxes';

        options.forEach((option, idx) => {
            const optionId = `${id}-${idx}`;
            const item = document.createElement('div');
            item.className = 'rsvp-checkbox-item';

            const labelEl = buildLabel(option.label, optionId);
            labelEl.style.textAlign = 'left';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = optionId;
            input.name = name;
            input.value = option.value;

            const isCheckedFromValues = values && Object.prototype.hasOwnProperty.call(values, option.value) ? !!values[option.value] : false;
            const isCheckedFromOption = option.checked === true;
            input.checked = isCheckedFromValues || isCheckedFromOption;

            item.appendChild(labelEl);
            item.appendChild(input);
            list.appendChild(item);
        });

        wrapper.appendChild(list);
        return wrapper;
    }

    function buildLabel(text, forId) {
        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', forId);
        labelEl.textContent = text;
        return labelEl;
    }

    function formatAttendanceLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function normalizeAttendanceMap(map) {
        if (!map || typeof map !== 'object') {
            return {};
        }
        return Object.keys(map).reduce((acc, key) => {
            acc[key] = !!map[key];
            return acc;
        }, {});
    }

    function getRsvpQuestions() {
        return [
            { key: 'go_to_karaoke_song', label: 'What\'s your go-to karaoke song?' },
            { key: 'favourite_movie', label: 'What\'s your favourite movie?' },
            { key: 'favorite_holiday_destination', label: 'Where is your favourite holiday destination?' },
            { key: 'name_of_pet', label: 'If you have a pet, what is his/her name?' },
            { key: 'favourite_dessert', label: 'What\'s your favourite dessert?' },
        ];
    }

    function getOrderedAttendanceKeys(attendanceValues) {
        const order = [
            'ceremony',
            'cocktail_parade',
            'harbour_cruise',
            'wedding_breakfast',
            'evening'
        ];
        const available = Object.keys(attendanceValues || {});
        const orderedKeys = order.filter((key) => available.includes(key));

        // include any remaining keys not in the predefined order
        available.forEach((key) => {
            if (!orderedKeys.includes(key)) {
                orderedKeys.push(key);
            }
        });

        return orderedKeys;
    }

    function gatherAttendanceValues(baseValues, checkboxes) {
        const updated = { ...(baseValues || {}) };
        checkboxes.forEach((checkbox) => {
            updated[checkbox.value] = checkbox.checked;
        });
        return updated;
    }

    function validateGuestInputs({ firstNameInput, lastNameInput, emailInput, phoneInput, questionInputs }) {
        const missing = [];
        if (!firstNameInput?.value.trim()) {
            missing.push('First Name');
        }
        if (!lastNameInput?.value.trim()) {
            missing.push('Last Name');
        }
        if (!emailInput?.value.trim()) {
            missing.push('Email Address');
        }
        if (!phoneInput?.value.trim()) {
            missing.push('Phone Number');
        }

        const answeredCount = Array.isArray(questionInputs)
            ? questionInputs.filter((entry) => entry?.input?.value.trim()).length
            : 0;

        const messages = [];
        if (missing.length > 0) {
            messages.push(`Complete: ${missing.join(', ')}`);
        }
        if (answeredCount < 3) {
            messages.push(`Answer at least 3 of the 5 entertainment questions (currently ${answeredCount})`);
        }

        if (messages.length > 0) {
            const bulletList = [
                ...missing.map((item) => `- ${item}`),
                ...(answeredCount < 3 ? [`- Answer at least 3 of the 5 entertainment questions (currently ${answeredCount})`] : [])
            ];
            return {
                valid: false,
                message: `Please complete:\n${bulletList.join('\n')}`
            };
        }

        return { valid: true, message: '' };
    }

    async function saveGuestRsvp({
        guestId,
        attendanceValues,
        attendanceCheckboxes,
        dietaryCheckboxes,
        dietaryTextInput,
        firstNameInput,
        lastNameInput,
        emailInput,
        phoneInput,
        questionInputs,
        form,
        submitButton,
        statusIcon,
        header,
        fields,
        toggle,
        warningEl
    }) {
        if (!guestId || typeof db === 'undefined') {
            return;
        }

        const originalText = submitButton.textContent;
        if (warningEl) {
            warningEl.textContent = '';
        }
        submitButton.classList.remove('invalid');

        const validation = validateGuestInputs({
            firstNameInput,
            lastNameInput,
            emailInput,
            phoneInput,
            questionInputs
        });

        if (!validation.valid) {
            if (warningEl) {
                warningEl.textContent = validation.message;
            }
            if (fields && form && toggle) {
                setGuestFieldsExpanded(form, fields, toggle, true);
                fields.style.maxHeight = `${fields.scrollHeight}px`;
            }
            submitButton.classList.add('invalid');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        try {
            const updatedAttendance = gatherAttendanceValues(attendanceValues, attendanceCheckboxes);
            const isVegan = dietaryCheckboxes.some((cb) => cb.value === 'vegan' && cb.checked);
            const isVegetarian = dietaryCheckboxes.some((cb) => cb.value === 'vegetarian' && cb.checked);
            const dietaryText = (dietaryTextInput?.value || '').trim();

            const payload = {
                first_name: (firstNameInput?.value || '').trim(),
                last_name: (lastNameInput?.value || '').trim(),
                email: (emailInput?.value || '').trim(),
                phone_number: (phoneInput?.value || '').trim(),
                attendance: updatedAttendance,
                dietary_requirements: dietaryText,
                vegan: isVegan,
                vegetarian: isVegetarian,
                submitted_form: true,
            };

            if (Array.isArray(questionInputs)) {
                questionInputs.forEach((entry) => {
                    if (entry?.key) {
                        payload[entry.key] = (entry.input?.value || '').trim();
                    }
                });
            }

            await db.collection('guests').doc(guestId).set(payload, { merge: true });
            if (warningEl) {
                warningEl.textContent = '';
            }
            markGuestSubmitted(form, submitButton, statusIcon, header, toggle);
            setGuestFieldsExpanded(form, fields, toggle, false);
        } catch (error) {
            console.error('Failed to save RSVP', error);
            submitButton.textContent = 'Save failed. Retry';
            submitButton.classList.remove('submitted');
        } finally {
            submitButton.disabled = false;
            if (!submitButton.classList.contains('submitted')) {
                submitButton.textContent = originalText;
            }
        }
    }

    function markGuestSubmitted(form, submitButton, statusEl, header, toggle) {
        form.classList.add('submitted');
        submitButton.textContent = 'Update RSVP';
        submitButton.classList.add('submitted');
        let icon = statusEl;
        if (!icon && toggle) {
            icon = document.createElement('span');
            icon.className = 'rsvp-status-icon submitted';
            icon.setAttribute('aria-label', 'Submitted');
            icon.setAttribute('title', 'Submitted');
            toggle.insertBefore(icon, toggle.querySelector('.rsvp-guest-toggle-icon'));
        }
        if (icon) {
            icon.classList.add('submitted');
            icon.textContent = '✓';
        }
    }

    function setGuestFieldsExpanded(form, fields, toggle, expanded) {
        form.classList.toggle('collapsed', !expanded);
        toggle.setAttribute('aria-expanded', String(expanded));
        if (expanded) {
            fields.style.display = 'grid';
            fields.style.maxHeight = `${fields.scrollHeight}px`;
        } else {
            fields.style.maxHeight = '0px';
            // delay hiding display to allow animation
            setTimeout(() => {
                if (form.classList.contains('collapsed')) {
                    fields.style.display = 'none';
                }
            }, 650);
        }
    }

    function enforceExclusiveCheckboxes(checkboxes) {
        if (!checkboxes || checkboxes.length === 0) {
            return;
        }

        // Ensure only the first checked one remains selected on initial render.
        const firstChecked = checkboxes.find((cb) => cb.checked);
        if (firstChecked) {
            checkboxes.forEach((cb) => {
                if (cb !== firstChecked) {
                    cb.checked = false;
                }
            });
        }

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    return;
                }
                checkboxes.forEach((cb) => {
                    if (cb !== checkbox) {
                        cb.checked = false;
                    }
                });
            });
        });
    }

    function renderRsvpError(message) {
        if (!underlayContent) {
            return;
        }

        underlayContent.textContent = message;
    }

    function showRsvpLoadingState() {
        if (!underlayContent) {
            return;
        }

        const loadingForm = document.createElement('form');
        loadingForm.className = 'underlay-form';
        loadingForm.setAttribute('aria-label', 'Loading RSVP form');

        const loadingText = document.createElement('p');
        loadingText.textContent = 'Loading your RSVP...';

        loadingForm.appendChild(loadingText);

        underlayContent.innerHTML = '';
        underlayContent.appendChild(loadingForm);
    }
});

function closeWater(wave, waterContent, wrapper, waveUnderlay) {
    if (wave) {
        wave.classList.remove('water-open');
    }
    if (waveUnderlay) {
        waveUnderlay.classList.remove('water-open');
    }
    if (waterContent) {
        waterContent.setAttribute('aria-hidden', 'true');
    }
    if (wrapper) {
        wrapper.classList.remove('water-open');
    }
}

function closeNavMenu(menu, toggle) {
    if (!menu || !toggle || !menu.classList.contains('open')) {
        return;
    }

    if (typeof closeMenu === 'function') {
        closeMenu(menu, toggle);
        return;
    }

    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
}
ƒƒƒƒƒƒƒƒƒƒƒƒƒ
