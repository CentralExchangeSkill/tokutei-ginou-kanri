import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorker } from '../../lib/workersApi';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  passport_no: z.string().min(1, 'Passport number is required'),
  residence_card_no: z.string().min(1, 'Residence card number is required'),
  visa_type: z.string().min(1, 'Visa type is required'),
  visa_expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
});

export default function NewWorkerPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nationality: '',
      passport_no: '',
      residence_card_no: '',
      visa_type: '',
      visa_expiry_date: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await createWorker(data);
      navigate('/workers');
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <section>
      <h1>Add Worker</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p role="alert">{errors.name.message}</p>}

        <label htmlFor="nationality">Nationality</label>
        <input id="nationality" {...register('nationality')} />
        {errors.nationality && <p role="alert">{errors.nationality.message}</p>}

        <label htmlFor="passport_no">Passport No</label>
        <input id="passport_no" {...register('passport_no')} />
        {errors.passport_no && <p role="alert">{errors.passport_no.message}</p>}

        <label htmlFor="residence_card_no">Residence Card No</label>
        <input id="residence_card_no" {...register('residence_card_no')} />
        {errors.residence_card_no && <p role="alert">{errors.residence_card_no.message}</p>}

        <label htmlFor="visa_type">Visa Type</label>
        <input id="visa_type" {...register('visa_type')} />
        {errors.visa_type && <p role="alert">{errors.visa_type.message}</p>}

        <label htmlFor="visa_expiry_date">Visa Expiry Date</label>
        <input id="visa_expiry_date" type="date" {...register('visa_expiry_date')} />
        {errors.visa_expiry_date && <p role="alert">{errors.visa_expiry_date.message}</p>}

        {serverError && <p role="alert">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create Worker'}
        </button>
      </form>
    </section>
  );
}
