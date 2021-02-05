import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// loadStripe is initialized with your real test publishable API key.
const promise = loadStripe("pk_test_51HxoDdKz9BHgVnoiMrQ4D5kc9QPx5Vlb9LKMb4uDOod9OkgQY9rbwz3ZIaj9a0GxYzkaZ9PgPtRTGkoHYR7lDa3H00z9Khuvby");

export default () => {
  return (
    <div>
      <Elements stripe={promise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
