import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GradeReview } from './schema/gradeReview.schema';
import { AddGradeReviewDto } from './dto/add-gradeReview.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GradeReviewsService {
  constructor(
    @InjectModel('GradeReview')
    private gradeReviewsModel: Model<GradeReview>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async add(
    classId: string,
    assignmentId: string,
    userData: AddGradeReviewDto,
  ) {
    const newGradeReview = {
      classId: classId,
      assignmentId: assignmentId,
      studentId: userData.studentId,
      finalGrade: userData.finalGrade,
      expectedGrade: userData.expectedGrade,
      message: userData.message,
    };
    const createGradeReview = new this.gradeReviewsModel(newGradeReview);
    return createGradeReview.save();
  }
  async delete(gradeReviewId: string): Promise<GradeReview | null> {
    try {
      return await this.gradeReviewsModel
        .findOneAndDelete({ _id: gradeReviewId })
        .exec();
    } catch (error) {
      throw new Error(error);
    }
  }
  async findOneAndUpdate(
    gradeReviewId: string,
    updatedData: any,
  ): Promise<GradeReview | null> {
    return await this.gradeReviewsModel
      .findOneAndUpdate({ _id: gradeReviewId }, updatedData, { new: true })
      .exec();
  }
  async findAllByClassId(classId: string): Promise<GradeReview[]> {
    return await this.gradeReviewsModel.find({ classId }).exec();
  }
  async findAllByStudentId(studentId: string): Promise<GradeReview[]> {
    return await this.gradeReviewsModel.find({ studentId }).exec();
  }
  async findAllByAssignmentId(assignmentId: string): Promise<GradeReview[]> {
    return await this.gradeReviewsModel.find({ assignmentId }).exec();
  }
  async findOneById(gradeReviewId: string): Promise<GradeReview> {
    return await this.gradeReviewsModel.findOne({ _id: gradeReviewId }).exec();
  }
  async findAllByEachStudent(
    classId: string,
    assignmentId: string,
    studentId: string,
  ): Promise<GradeReview[]> {
    return await this.gradeReviewsModel
      .find({
        classId,
        assignmentId,
        studentId,
      })
      .exec();
  }
}
