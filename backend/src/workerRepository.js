class WorkerRepository {
  constructor() {
    this.workers = [];
  }

  findByPassportNo(passportNo) {
    return this.workers.find((worker) => worker.passport_no === passportNo);
  }

  findByResidenceCardNo(residenceCardNo) {
    return this.workers.find((worker) => worker.residence_card_no === residenceCardNo);
  }

  create(worker) {
    const createdWorker = {
      id: this.workers.length + 1,
      ...worker,
      created_at: new Date().toISOString(),
    };

    this.workers.push(createdWorker);
    return createdWorker;
  }
}

module.exports = { WorkerRepository };
