import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string()
    .email('Invalid email')
    .required('Required'),
  password: yup.string()
    .min(8, 'Must be at least 8 characters')
    .matches(/[a-z]/, 'Needs lowercase letter')
    .matches(/[A-Z]/, 'Needs uppercase letter')
    .required('Required')
});

export const postSchema = yup.object().shape({
  content: yup.string()
    .max(500, 'Too long!')
    .required('Content is required')
});
