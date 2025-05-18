import { DanhMucSuKien } from '../types/EventTypeTypes';
import { CreateEventCategory } from '../types/RequestTypes';
import { BaseService } from './baseService';

class EventCategoryService extends BaseService<DanhMucSuKien, CreateEventCategory> {
    constructor() {
        super('danh-muc');
    }
}

export const eventCategoryService = new EventCategoryService();
export default eventCategoryService;