import React from 'react';
import { FormSection } from './FormSection';
import { FormGroup } from './FormGroup';
import { UncontrolledTextInput } from './UncontrolledTextInput';
import { GlobalParameters } from '@/shared/types/models';

interface ProjectDetailsFormProps {
  value: Partial<GlobalParameters>;
  onChange: (value: Partial<GlobalParameters>) => void;
}

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = React.memo(({
  value,
  onChange
}) => {
  const handleInputBlur = (field: keyof GlobalParameters) => (newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <FormSection title="Project Details (Optional)">
      <div className="space-y-4">
        <UncontrolledTextInput
          id="customerName"
          label="Client Name"
          value={value.customerName || ''}
          onBlur={handleInputBlur('customerName')}
          placeholder="Enter client name"
        />

        <UncontrolledTextInput
          id="projectName"
          label="Project Name"
          value={value.projectName || ''}
          onBlur={handleInputBlur('projectName')}
          placeholder="Enter project name"
        />

        <UncontrolledTextInput
          id="projectDescription"
          label="Project Description"
          value={value.projectDescription || ''}
          onBlur={handleInputBlur('projectDescription')}
          placeholder="Enter project description (Markdown supported)"
          multiline={true}
          rows={4}
          description="Supports Markdown formatting"
        />
      </div>
    </FormSection>
  );
});

export default ProjectDetailsForm;
