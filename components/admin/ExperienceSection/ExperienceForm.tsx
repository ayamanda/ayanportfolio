import React from 'react';
import { useForm } from 'react-hook-form';
import { Experience } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ExperienceFormProps {
  experience?: Experience | null;
  onSubmit: (data: Omit<Experience, 'id'>) => void;
  onCancel: () => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onSubmit,
  onCancel,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: experience || {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: [],
      companyLogo: '',
      order: 0,
    },
  });

  const onFormSubmit = (data: any) => {
    // Convert comma-separated technologies string to array
    const formattedData = {
      ...data,
      technologies: data.technologies ? data.technologies.split(',').map((tech: string) => tech.trim()) : [],
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title', { required: 'Title is required' })}
          placeholder="Job Title"
          className="bg-gray-800 border-gray-700 text-white"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('company', { required: 'Company is required' })}
          placeholder="Company Name"
          className="bg-gray-800 border-gray-700 text-white"
        />
        {errors.company && (
          <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('location')}
          placeholder="Location"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            {...register('startDate', { required: 'Start date is required' })}
            type="date"
            className="bg-gray-800 border-gray-700 text-white"
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register('endDate')}
            type="date"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div>
        <Textarea
          {...register('description', { required: 'Description is required' })}
          placeholder="Job Description"
          className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register('technologies')}
          placeholder="Technologies (comma-separated)"
          className="bg-gray-800 border-gray-700 text-white"
          defaultValue={experience?.technologies?.join(', ') || ''}
        />
      </div>

      <div>
        <Input
          {...register('companyLogo')}
          placeholder="Company Logo URL"
          className="bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div>
        <Input
          {...register('order', { required: 'Order is required' })}
          type="number"
          placeholder="Display Order"
          className="bg-gray-800 border-gray-700 text-white"
        />
        {errors.order && (
          <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {experience ? 'Update' : 'Add'} Experience
        </Button>
      </div>
    </form>
  );
}; 