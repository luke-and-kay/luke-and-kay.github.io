document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('challengeApp');
    if (!app) {
        return;
    }

    const mode = app.dataset.mode || 'list';
    const maxGuests = Number(app.dataset.maxGuests || 8);

    renderLoading(app);

    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        renderMessage(app, 'We could not load your invite right now. Please try again from the invite page.');
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (!user?.email) {
            renderLoggedOut(app);
            return;
        }

        try {
            const weddingPin = user.email.split('@')[0];
            const guests = await loadGuestsForWeddingPin(weddingPin);

            if (mode === 'person') {
                await renderPerson(app, guests, weddingPin);
                return;
            }

            renderGuestList(app, guests.slice(0, maxGuests));
        } catch (error) {
            console.error('Failed to load challenge page', error);
            renderMessage(app, 'We could not load your challenge page right now. Please try again.');
        }
    });
});

async function loadGuestsForWeddingPin(weddingPin) {
    if (!weddingPin) {
        throw new Error('Missing invite details');
    }

    const partyDoc = await db.collection('users').doc(weddingPin).get();
    if (!partyDoc.exists) {
        throw new Error('Invite not found');
    }

    const partyData = partyDoc.data() || {};
    const guestRefs = Array.isArray(partyData.guests) ? partyData.guests : [];
    const guestSnapshots = await Promise.all(
        guestRefs.map((ref) => ref.get().catch(() => null))
    );

    return guestSnapshots
        .filter((snap) => snap && snap.exists)
        .map((snap) => ({ id: snap.id, data: snap.data() || {} }));
}

async function loadChallengeQuestionsByGuest() {
    const challengeDoc = await db.collection('challenge').doc('guest_questions').get();
    if (!challengeDoc.exists) {
        throw new Error('Challenge questions not found');
    }

    const challengeData = challengeDoc.data() || {};
    const questionsByGuest = challengeData.questions_by_guest;
    if (!questionsByGuest || typeof questionsByGuest !== 'object' || Array.isArray(questionsByGuest)) {
        throw new Error('Challenge questions have an unexpected format');
    }

    return questionsByGuest;
}

async function loadChallengeAnswerState(guestId) {
    if (!guestId) {
        return {};
    }

    const answerDoc = await db.collection('challenge_answers').doc(guestId).get();
    return answerDoc.exists ? (answerDoc.data() || {}) : {};
}

function renderLoading(app) {
    app.innerHTML = '<p class="challenge-message">Loading your challenge...</p>';
}

function renderLoggedOut(app) {
    app.innerHTML = `
        <div class="challenge-card">
            <p class="challenge-message">Please log in from your invite to see this page.</p>
            <a class="challenge-action" href="${getHomeHref()}">Back to invite</a>
        </div>
    `;
}

function renderMessage(app, message) {
    app.innerHTML = `
        <div class="challenge-card">
            <p class="challenge-message">${escapeHtml(message)}</p>
            <a class="challenge-action" href="${getListHref()}">Back to challenge</a>
        </div>
    `;
}

function renderGuestList(app, guests) {
    if (!guests.length) {
        renderMessage(app, 'We could not find any guests for this invite.');
        return;
    }

    const items = guests.map((guest, index) => {
        const name = formatGuestName(guest.data) || `Guest ${index + 1}`;
        return `
            <li class="challenge-list-item">
                <a class="challenge-person-link" href="/challenge/${index + 1}">
                    <span class="challenge-person-name">${escapeHtml(name)}</span>
                </a>
            </li>
        `;
    }).join('');

    app.innerHTML = `
        <ul class="challenge-list">
            ${items}
        </ul>
    `;
}

async function renderPerson(app, guests, weddingPin) {
    const guestIndex = getGuestIndex();
    const guest = guests[guestIndex - 1];

    if (!guest) {
        app.innerHTML = `
            <div class="challenge-card">
                <p class="challenge-message">Guest not found.</p>
                <a class="challenge-action" href="/challenge">Back to challenge</a>
            </div>
        `;
        return;
    }

    const name = formatGuestName(guest.data) || `Guest ${guestIndex}`;
    const questionList = await buildQuestionList(name, guest.id);

    app.innerHTML = `
        <div class="challenge-person">
            <p class="challenge-person-page-name">${escapeHtml(name)}</p>
            ${questionList.html}
            <a class="challenge-action" href="/challenge">Back to challenge</a>
        </div>
    `;

    attachChallengeAnswerHandlers({
        app,
        questions: questionList.questions,
        savedAnswers: questionList.savedAnswers,
        askerGuestId: guest.id,
        askerName: name,
        weddingPin
    });
}

async function buildQuestionList(guestName, guestId) {
    try {
        const questionsByGuest = await loadChallengeQuestionsByGuest();
        const questions = findQuestionsForGuest(questionsByGuest, guestName);

        if (!Array.isArray(questions) || questions.length === 0) {
            return {
                html: '<p class="challenge-question-empty">No questions found for this guest yet.</p>',
                questions: []
            };
        }

        const answerState = await loadChallengeAnswerState(guestId).catch((error) => {
            console.error('Failed to load saved challenge answers', error);
            return {};
        });
        const savedAnswers = answerState.answers || {};
        const questionItems = questions.map((entry, index) => (
            renderChallengeQuestionItem(entry, index, savedAnswers[getQuestionKey(index)])
        )).join('');

        return {
            html: `
                <ol class="challenge-question-list">
                    ${questionItems}
                </ol>
            `,
            questions,
            savedAnswers
        };
    } catch (error) {
        console.error('Failed to load challenge questions', error);
        return {
            html: '<p class="challenge-question-empty">We could not load your questions right now. Please try again.</p>',
            questions: [],
            savedAnswers: {}
        };
    }
}

function renderChallengeQuestionItem(entry, index, savedAnswer) {
    const prompt = formatChallengeQuestion(entry);
    const hasSavedCorrectAnswer = savedAnswer?.correct === true;
    const savedSubmittedAnswer = hasSavedCorrectAnswer ? savedAnswer?.submitted_answer || '' : '';
    const statusClass = hasSavedCorrectAnswer ? ' correct' : '';
    const statusText = hasSavedCorrectAnswer ? '✓' : '';
    const statusLabel = hasSavedCorrectAnswer ? 'Correct' : '';
    const lockedAttributes = hasSavedCorrectAnswer ? 'disabled aria-disabled="true"' : '';
    const submitText = hasSavedCorrectAnswer ? 'Completed' : 'Submit';

    return `
        <li class="challenge-question-item">
            <div class="challenge-question-header">
                <p class="challenge-question-prompt">${escapeHtml(prompt)}</p>
                <span
                    class="challenge-answer-status${statusClass}"
                    role="status"
                    aria-live="polite"
                    aria-label="${statusLabel}"
                    title="${statusLabel}"
                >${statusText}</span>
            </div>
            <form class="challenge-answer-form" data-question-index="${index}">
                <input
                    class="challenge-answer-input"
                    type="text"
                    name="${getQuestionKey(index)}"
                    value="${escapeHtml(savedSubmittedAnswer)}"
                    autocomplete="off"
                    autocapitalize="characters"
                    aria-label="Answer for question ${index + 1}"
                    ${lockedAttributes}
                />
                <button class="challenge-answer-submit" type="submit" ${lockedAttributes}>${submitText}</button>
            </form>
            <p class="challenge-answer-error" role="alert"></p>
        </li>
    `;
}

function attachChallengeAnswerHandlers({ app, questions, savedAnswers, askerGuestId, askerName, weddingPin }) {
    if (!questions.length || !askerGuestId) {
        return;
    }

    const answerState = { ...(savedAnswers || {}) };

    app.querySelectorAll('.challenge-answer-form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const questionIndex = Number(form.dataset.questionIndex || 0);
            const entry = questions[questionIndex];
            if (!entry) {
                return;
            }

            const input = form.querySelector('.challenge-answer-input');
            const submitButton = form.querySelector('.challenge-answer-submit');
            const questionItem = form.closest('.challenge-question-item');
            const status = questionItem?.querySelector('.challenge-answer-status');
            const error = questionItem?.querySelector('.challenge-answer-error');
            if (input) {
                input.value = input.value.toUpperCase();
            }
            const submittedAnswer = input?.value || '';
            const correct = normalizeAnswer(submittedAnswer) === normalizeAnswer(entry.answer || '');
            const prompt = formatChallengeQuestion(entry);
            const questionKey = getQuestionKey(questionIndex);

            if (error) {
                error.textContent = '';
            }
            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                if (!correct) {
                    setAnswerStatus(status, false);
                    return;
                }

                if (submitButton) {
                    submitButton.textContent = 'Saving';
                }

                await saveChallengeAnswer({
                    askerGuestId,
                    askerName,
                    weddingPin,
                    questionKey,
                    entry,
                    prompt,
                    submittedAnswer,
                    correct
                });
                answerState[questionKey] = { correct };
                setAnswerStatus(status, correct);
                lockCorrectAnswer({ input, submitButton });
                if (allChallengeAnswersCorrect(answerState, questions.length)) {
                    await savePrizeWinner(askerName);
                }
            } catch (saveError) {
                console.error('Failed to save challenge answer', saveError);
                if (error) {
                    error.textContent = 'We could not save that answer. Please try again.';
                }
            } finally {
                if (submitButton && !correct) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                }
            }
        });

        const input = form.querySelector('.challenge-answer-input');
        if (input) {
            input.addEventListener('input', () => {
                const cursorStart = input.selectionStart;
                const cursorEnd = input.selectionEnd;
                input.value = input.value.toUpperCase();
                input.setSelectionRange(cursorStart, cursorEnd);
            });
        }
    });
}

async function saveChallengeAnswer({
    askerGuestId,
    askerName,
    weddingPin,
    questionKey,
    entry,
    prompt,
    submittedAnswer,
    correct
}) {
    const timestamp = getFirestoreTimestamp();
    const payload = {
        asker_guest_id: askerGuestId,
        asker_name: askerName,
        wedding_pin: weddingPin,
        updated_at: timestamp,
        answers: {
            [questionKey]: {
                question: (entry?.question || '').trim(),
                answering_guest: getAnsweringGuestName(entry),
                prompt,
                submitted_answer: submittedAnswer,
                correct: true,
                submitted_at: timestamp
            }
        }
    };

    await db.collection('challenge_answers').doc(askerGuestId).set(payload, { merge: true });
}

async function savePrizeWinner(askerName) {
    if (!askerName) {
        return;
    }

    await db.collection('prize_winners').doc('winners').set({
        names: firebase.firestore.FieldValue.arrayUnion(askerName),
        updated_at: getFirestoreTimestamp()
    }, { merge: true });
}

function allChallengeAnswersCorrect(answerState, questionCount) {
    if (!questionCount) {
        return false;
    }

    return Array.from({ length: questionCount }).every((_, index) => (
        answerState[getQuestionKey(index)]?.correct === true
    ));
}

function setAnswerStatus(status, correct) {
    if (!status) {
        return;
    }

    status.classList.toggle('correct', correct);
    status.classList.toggle('incorrect', !correct);
    status.textContent = correct ? '✓' : '✕';
    status.setAttribute('aria-label', correct ? 'Correct' : 'Incorrect');
    status.setAttribute('title', correct ? 'Correct' : 'Incorrect');
}

function lockCorrectAnswer({ input, submitButton }) {
    if (input) {
        input.disabled = true;
        input.setAttribute('aria-disabled', 'true');
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-disabled', 'true');
        submitButton.textContent = 'Completed';
    }
}

function formatChallengeQuestion(entry) {
    const questionType = (entry?.question || '').trim().toLowerCase();
    const answeringGuest = getAnsweringGuestName(entry);
    const answer = (entry?.answer || '').trim();
    const displayName = answeringGuest || 'this guest';
    const possessiveName = formatPossessiveName(displayName);

    if (questionType === 'holiday') {
        return `Where is ${possessiveName} favourite holiday destination?`;
    }

    if (questionType === 'movie') {
        return `What is ${possessiveName} favourite movie?`;
    }

    if (questionType === 'pet') {
        if (answer.includes(' and ')) {
            return `What are ${possessiveName} pets' names?`;
        }
        return `What is ${possessiveName} pet's name?`;
    }

    if (questionType === 'dessert') {
        return `What is ${possessiveName} favourite dessert?`;
    }

    if (questionType === 'song') {
        return `What is ${possessiveName} go-to karaoke song?`;
    }

    return `Ask ${displayName} about ${questionType || 'their answer'}.`;
}

function getAnsweringGuestName(entry) {
    return (
        entry?.answering_guest ||
        entry?.guest_name ||
        entry?.guest ||
        entry?.name ||
        ''
    ).trim();
}

function formatPossessiveName(name) {
    if (name.toLowerCase().endsWith('s')) {
        return `${name}'`;
    }

    return `${name}'s`;
}

function findQuestionsForGuest(questionsByGuest, guestName) {
    if (Array.isArray(questionsByGuest[guestName])) {
        return questionsByGuest[guestName];
    }

    const normalizedGuestName = normalizeGuestNameKey(guestName);
    const matchingKey = Object.keys(questionsByGuest).find((key) => (
        normalizeGuestNameKey(key) === normalizedGuestName
    ));

    return matchingKey ? questionsByGuest[matchingKey] : null;
}

function normalizeGuestNameKey(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeAnswer(answer) {
    return String(answer || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function getQuestionKey(index) {
    return `question_${index + 1}`;
}

function getFirestoreTimestamp() {
    if (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue?.serverTimestamp) {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    return new Date();
}

function getGuestIndex() {
    const app = document.getElementById('challengeApp');
    const configuredIndex = Number(app?.dataset.guestIndex || 0);
    if (configuredIndex > 0) {
        return configuredIndex;
    }

    const match = window.location.pathname.match(/\/(\d+)(?:\.html)?\/?$/);
    return match ? Number(match[1]) : 0;
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

function getHomeHref() {
    return '/';
}

function getListHref() {
    return '/challenge';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
