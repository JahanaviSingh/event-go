import QRCode from 'qrcode'

interface TicketData {
  userId: string
  showtimeId: number
  seats: Array<{ row: number; column: number }>
  bookingId: string
}

export async function generateQRCode(data: TicketData): Promise<string> {
  const ticketData = {
    ...data,
    timestamp: new Date().toISOString(),
  }

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    return qrCodeDataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}
