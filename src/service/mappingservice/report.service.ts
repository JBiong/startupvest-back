import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Report } from "src/entities/mappingentities/report.entity";
import { Repository } from "typeorm";

@Injectable()
export class ReportService {
	constructor(
		@InjectRepository(Report)
		private readonly reportRepository: Repository<Report>
	) {}

	async create(report: Partial<Report>): Promise<Report> {
		return this.reportRepository.save(report);
	}

	async update(id: number, reportData: Partial<Report>): Promise<Report> {
		const existingReport = await this.reportRepository.findOneBy({ id });

		if (!existingReport) {
			throw new NotFoundException("Report not found");
		}
		return this.reportRepository.save({ ...existingReport, ...reportData });
	}

	async findAll(): Promise<Report[]> {
		return this.reportRepository.find();
	}

	async findOneById(id: number): Promise<Report | null> {
		return this.reportRepository.findOneBy({ id });
	}

	async findAllByUserId(userId: number): Promise<Report[]> {
		return this.reportRepository.find({ where: { generated_by: userId } });
	}

	async remove(id: number): Promise<void> {
		await this.reportRepository.delete(id);
	}
}
