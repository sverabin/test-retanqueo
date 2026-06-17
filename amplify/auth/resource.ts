import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      required: true,
      mutable: true,
    },
    'custom:Cédula': {
      dataType: "Number",
      mutable: true,
      maxLen: 10,
      minLen: 1,
      required: true,
    }
  },
});
