import {Entity, model, property} from '@loopback/repository';

@model({name: 'toggle'})
export class Toggle extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  value: boolean;

  constructor(data?: Partial<Toggle>) {
    super(data);
  }
}

export interface ToggleRelations {
  // describe navigational properties here
}

export type ToggleWithRelations = Toggle & ToggleRelations;
