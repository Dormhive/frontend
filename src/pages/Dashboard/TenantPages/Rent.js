import React from 'react';
import Payment from '../TenantComponents/Payment';
import History from '../TenantComponents/History';

export default function Rent(props) {
  // Optionally, you can pass a callback to refresh history after payment
  const handlePaymentSuccess = () => {
    if (History.refresh) History.refresh();
  };

  return (
    <section>
      <Payment {...props} onPaymentSuccess={handlePaymentSuccess} />
      <History />
    </section>
  );
}