import { Injectable } from '@nestjs/common';
import { ClassesService } from '../../../classes/classes.service';
import mongoose from 'mongoose';
import { SortOrderEnum } from '../../../../enums/sort-order.enum';
import { ClassStatusEnum } from '../../../../enums/class-status.enum';
import { ClassActionEnum } from '../../../../enums/class-action.enum';

const PAGE_NUMBER_DEFAULT: number = 1;
const PAGE_SIZE_NUMBER_DEFAULT: number = 8;
@Injectable()
export class ClassService {
  constructor(private classesService: ClassesService) {}

  async getClasses(
    page: number = PAGE_NUMBER_DEFAULT,
    pageSize: number = PAGE_SIZE_NUMBER_DEFAULT,
    searchTerm: string = '',
    status: string = '',
    action: string = '',
    sortedBy: string = 'classId',
    sortOrder: string = SortOrderEnum.Increase,
  ) {
    const skip = (page - 1) * pageSize;
    const filter = this.createFilterForGettingClasses(
      searchTerm,
      status,
      action,
    );
    if (!filter) {
      return { totalPages: 0, classes: [] };
    }
    return await this.classesService.getClassListByPage(
      { skip, take: pageSize },
      filter,
      { sortedBy, sortOrder },
    );
  }
  private isMatchStatusAndAction(status: string, action: string) {
    return (
      status === '' ||
      action === '' ||
      (status.toLowerCase() === ClassStatusEnum.Active &&
        action.toLowerCase() === ClassActionEnum.ARCHIVE) ||
      (status.toLowerCase() === ClassStatusEnum.Archived &&
        (action.toLowerCase() === ClassActionEnum.RESTORE ||
          action.toLowerCase() === ClassActionEnum.DELETE))
    );
  }
  private createFilterForGettingClasses(
    searchTerm: string,
    status: string,
    action: string,
  ) {
    let filter: any = [];
    if (searchTerm !== '') {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(searchTerm);
      filter = [
        ...filter,
        {
          $or: isValidObjectId
            ? [
                { _id: searchTerm },
                { className: { $regex: searchTerm, $options: 'i' } },
              ]
            : [{ className: { $regex: searchTerm, $options: 'i' } }],
        },
      ];
    }
    if (this.isMatchStatusAndAction(status, action)) {
      if (status !== '') {
        return { $and: [...filter, { status: status.toLowerCase() }] };
      } else if (action !== '') {
        switch (action.toLowerCase()) {
          case ClassActionEnum.ARCHIVE:
            return {
              $and: [...filter, { status: ClassStatusEnum.Active }],
            };
          case ClassActionEnum.RESTORE:
          case ClassActionEnum.DELETE:
            return { $and: [...filter, { status: ClassStatusEnum.Archived }] };
        }
      } else {
        return filter.length !== 0 ? { $and: filter } : {};
      }
    }
    return null;
  }
  async archiveClass(classId: string) {
    return this.classesService.adminArchive(classId);
  }
  async restoreClass(classId: string) {
    return this.classesService.adminRestore(classId);
  }
  async deleteClass(classId: string) {
    return this.classesService.adminDelete(classId);
  }
}
