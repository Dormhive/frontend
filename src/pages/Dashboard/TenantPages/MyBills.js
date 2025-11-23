import React from 'react';
import MyBills from '../TenantComponents/MyBills';

export default function MyBillsPage(props) {
  return (
    <section>
      <MyBills {...props} />
    </section>
  );
}