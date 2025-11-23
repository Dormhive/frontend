import React from 'react';

export default function SubmitTicketPage({
  ticketText,
  setTicketText,
  ticketError,
  ticketSuccess,
  ticketSubmitting,
  handleSubmitTicket,
  handleCancel,
}) {
  return (
    <section style={{ marginTop: 20 }}>
      <h3>Submit Ticket</h3>
      <form onSubmit={handleSubmitTicket} style={{ marginTop: 12, background: '#fff', padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Describe your complaint</label>
          <textarea
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            placeholder="Type your complaint or message to the owner..."
            required
          />
        </div>
        {ticketError && (
          <div style={{ marginBottom: 8, color: '#c33' }}>
            {ticketError}
          </div>
        )}
        {ticketSuccess && (
          <div style={{ marginBottom: 8, color: '#188a00' }}>
            {ticketSuccess}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="submit-btn" type="submit" disabled={ticketSubmitting}>
            {ticketSubmitting ? 'Submitting...' : 'Send to Owner'}
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}