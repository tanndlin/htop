export type CpuInfo = {
    cpu_usages: number[];
};

export type RamInfo = {
    total: number;
    used: number;
    free: number;
};

export type RequestMessage = {
    info_type: InfoType;
};

export enum InfoType {
    CPU = 'CPU',
    RAM = 'RAM'
}

export type ResponseMessage =
    | {
          info_type: InfoType.CPU;
          data: { CpuInfo: CpuInfo };
      }
    | {
          info_type: InfoType.RAM;
          data: { RamInfo: RamInfo };
      };
