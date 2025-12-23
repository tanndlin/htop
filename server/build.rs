use std::fs::create_dir_all;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("cargo:rerun-if-changed=proto");

    create_dir_all("src/proto_gen")?;

    prost_build::Config::new()
        .out_dir("src/proto_gen")
        .compile_protos(&["../common/protos/api.proto"], &["../common/protos/"])?;

    Ok(())
}
