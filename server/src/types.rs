#[derive(serde::Serialize)]
pub struct RamInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(serde::Serialize)]
pub struct CpuInfo {
    pub cpu_usages: Vec<f32>,
}
