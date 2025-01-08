// import { EmailTemplate } from '@/app/components/email-template'
import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("body", body)

    const { data, error } = await resend.emails.send({
      from: 'decomposer <decomposer@jordansucher.com>',
      to: body.recipient,
      subject: 'Hello world',
      html: `<a href=${body.songUrl}>Your turn!</a>`,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
