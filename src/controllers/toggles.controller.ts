import {get, param, RestBindings, Response, modelToJsonSchema, requestBody, post, del} from '@loopback/rest';
import {inject} from '@loopback/core';
import {ToggleService} from '../services';
import {Toggle} from '../models';
import {ToggleMysqlRepository} from '../repositories';

export class TogglesController {
  constructor(
    @inject('services.ToggleService') private toggleService: ToggleService,
    @inject('repositories.ToggleMysqlRepository') private toggleMysqlRepository: ToggleMysqlRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {}

  @get('/toggles', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: [modelToJsonSchema(Toggle)],
            },
          },
        },
      },
    },
  })
  getAllToggles(): Promise<Toggle[]> {
    return this.toggleMysqlRepository.find();
  }

  @get('/toggles/{key}', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {type: 'boolean'},
          },
        },
      },
      '404': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: {type: 'integer'},
                message: {type: 'string'},
              },
              required: ['code', 'message'],
            },
          },
        },
      },
    },
  })
  async isToggleOn(@param.path.string('key') key: string) {
    try {
      return await this.toggleService.isToggleOn(key);
    } catch (_) {
      this.response.status(404).json({code: 1_000, message: 'invalid toggle key'});
    }
  }

  @post('/toggles')
  async saveToggle(@requestBody() toggle: Toggle) {
    await this.toggleService.setToggle(toggle);
    return toggle;
  }

  @del('/toggles/{key}')
  async deleteToggle(@param.path.string('key') key: string) {
    await this.toggleService.deleteToggle(key);
    this.response.status(200).send();
  }
}
