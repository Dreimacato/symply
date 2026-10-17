import type { Schema, Struct } from '@strapi/strapi';

export interface HealthTriageCriteria extends Struct.ComponentSchema {
  collectionName: 'components_health_triage_criteria';
  info: {
    displayName: 'Triage Criteria';
  };
  attributes: {
    Condition: Schema.Attribute.Text;
    Triage_Level: Schema.Attribute.Enumeration<
      ['Emergency', 'Urgent', 'Non-Urgent']
    >;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'health.triage-criteria': HealthTriageCriteria;
    }
  }
}
