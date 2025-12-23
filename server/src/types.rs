use axum::body::Bytes;
use serde::{Deserialize, Serialize};

#[allow(clippy::upper_case_acronyms)]
#[derive(Deserialize, Serialize)]
pub enum InfoType {
    CPU,
    RAM,
}

#[derive(Serialize)]
pub struct CpuInfo {
    pub cpu_usages: Vec<f32>,
}

#[derive(Serialize)]
pub struct RamInfo {
    pub total: u64,
    pub used: u64,
    pub free: u64,
}

#[derive(Deserialize, Serialize)]
pub struct RequestMessage {
    pub info_type: InfoType,
}

impl TryFrom<Bytes> for RequestMessage {
    type Error = String;

    fn try_from(bytes: Bytes) -> Result<Self, Self::Error> {
        match serde_json::from_slice(&bytes) {
            Ok(msg) => Ok(msg),
            Err(err) => Err(err.to_string()),
        }
    }
}

#[derive(Serialize)]
pub enum ResponseData {
    CpuInfo(CpuInfo),
    RamInfo(RamInfo),
}

#[derive(Serialize)]
pub struct ResponseMessage {
    pub info_type: InfoType,
    pub data: ResponseData,
}

impl From<ResponseMessage> for Bytes {
    fn from(value: ResponseMessage) -> Self {
        serde_json::to_vec(&value).unwrap().into()
    }
}
