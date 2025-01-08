type emailParams = {
    recipient: string
    songUrl: string
}

export const emailSender = {
    async sendTestEmail(emailParams: emailParams) {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailParams)
        });

        if (!response.ok) throw new Error('Failed to send email');
        const data = await response.json();
        return data;        
    }

}
