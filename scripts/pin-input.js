document.addEventListener('DOMContentLoaded', () => {
    const inputs = Array.from(document.querySelectorAll('.pin-input'));
    const pasteButton = document.getElementById('pasteBtn');
    if (!inputs.length || !pasteButton) {
        return;
    }

    inputs.forEach((input, index) => {
        input.addEventListener('focus', () => input.select());
        input.addEventListener('click', () => input.select());
        input.addEventListener('input', (event) => handleDigitInput(event, index, inputs));
        input.addEventListener('keydown', (event) => handleBackspace(event, index, inputs));
        input.addEventListener('paste', (event) => {
            event.preventDefault();
            handlePaste(event.clipboardData.getData('text'), inputs);
        });
    });

    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            handlePaste(text, inputs);
        } catch (error) {
            alert(`Failed to read clipboard: ${error.message}`);
        }
    });

    inputs[0].focus();
});

function handleDigitInput(event, index, inputs) {
    const input = event.target;
    const value = input.value.replace(/[^0-9]/g, '');

    if (value) {
        input.value = value;
        if (index < inputs.length - 1) {
            inputs[index + 1].focus();
            inputs[index + 1].select();
        }
    } else {
        input.value = '';
    }
}

function handleBackspace(event, index, inputs) {
    if (event.key !== 'Backspace') {
        return;
    }

    const input = event.target;
    input.value = '';
    if (index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].select();
    }
}

function handlePaste(text, inputs) {
    const digits = text.replace(/\D/g, '').slice(0, inputs.length);
    inputs.forEach((input, i) => {
        input.value = digits[i] || '';
    });

    if (digits.length > 0) {
        const nextIndex = Math.min(digits.length, inputs.length - 1);
        inputs[nextIndex].focus();
        inputs[nextIndex].select();
    }
}
