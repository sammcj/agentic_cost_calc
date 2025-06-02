import React from 'react';
import { FormSection } from './FormSection';
import { FormGroup } from './FormGroup';
import { GlobalParameters } from '@/shared/types/models';

interface ProjectDetailsFormProps {
  value: Partial<GlobalParameters>;
  onChange: (value: Partial<GlobalParameters>) => void;
}

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  value,
  onChange
}) => {
  const handleInputChange = (field: keyof GlobalParameters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...value,
      [field]: e.target.value
    });
  };

  return (
    <FormSection title="Project Details (Optional)">
      <FormGroup
        label="Client Name"
        id="customerName"
        required={false}
      >
        <input
          type="text"
          id="customerName"
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={value.customerName || ''}
          onChange={handleInputChange('customerName')}
          placeholder="Enter client name"
        />
      </FormGroup>

      <FormGroup
        label="Project Name"
        id="projectName"
        required={false}
      >
        <input
          type="text"
          id="projectName"
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={value.projectName || ''}
          onChange={handleInputChange('projectName')}
          placeholder="Enter project name"
        />
      </FormGroup>

      <FormGroup
        label="Project Description"
        id="projectDescription"
        required={false}
        hint="Supports Markdown formatting"
      >
        <textarea
          id="projectDescription"
          className="form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={value.projectDescription || ''}
          onChange={handleInputChange('projectDescription')}
          placeholder="Enter project description (Markdown supported)"
          rows={4}
        />
      </FormGroup>
    </FormSection>
  );
};

export default ProjectDetailsForm;
