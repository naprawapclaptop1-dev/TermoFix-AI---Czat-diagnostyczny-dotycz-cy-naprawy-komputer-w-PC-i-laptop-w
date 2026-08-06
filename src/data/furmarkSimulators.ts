export interface FurmarkSimulatorPreset {
  id: string;
  name: string;
  category: 'FurMark GPU' | 'MSI Kombustor' | 'Prime95 CPU' | 'OCCT Power' | 'AIDA64' | 'Unigine 3D' | '3DMark' | 'VRAM & BGA' | 'VRM & Power' | 'Cinebench & Compute';
  type: 'GPU' | 'CPU' | 'SYSTEM' | 'VRAM' | 'VRM';
  gpuName: string;
  api: 'Vulkan' | 'DirectX 12' | 'OpenGL 4.6' | 'CUDA' | 'ROCm' | 'OpenCL' | 'AVX512';
  resolution: '1080p' | '1440p 2K' | '4K UHD' | '8K FUHD';
  targetComponent: string;
  loadType: string;
  description: string;
  baseCoreTemp: number;
  peakCoreTemp: number;
  baseHotspot: number;
  peakHotspot: number;
  baseVram: number;
  peakVram: number;
  basePower: number;
  peakPower: number;
  baseFps: number;
  peakFps: number;
}

const GPU_MODELS = [
  'NVIDIA GeForce RTX 5090 32GB GDDR7',
  'NVIDIA GeForce RTX 5080 16GB GDDR7',
  'NVIDIA GeForce RTX 5070 Ti 16GB GDDR7',
  'NVIDIA GeForce RTX 4090 24GB GDDR6X',
  'NVIDIA GeForce RTX 4080 Super 16GB',
  'NVIDIA GeForce RTX 4070 Ti Super 16GB',
  'NVIDIA GeForce RTX 3090 Ti 24GB GDDR6X',
  'AMD Radeon RX 7900 XTX 24GB GDDR6',
  'AMD Radeon RX 7900 XT 20GB GDDR6',
  'AMD Radeon RX 7800 XT 16GB GDDR6',
  'Intel Arc B580 12GB GDDR6',
  'Intel Arc A770 16GB GDDR6',
  'NVIDIA RTX 6000 Ada Generation 48GB',
  'NVIDIA Quadro RTX 8000 48GB'
];

const RESOLUTIONS: ('1080p' | '1440p 2K' | '4K UHD' | '8K FUHD')[] = ['1080p', '1440p 2K', '4K UHD', '8K FUHD'];
const APIS: ('Vulkan' | 'DirectX 12' | 'OpenGL 4.6' | 'CUDA' | 'ROCm' | 'OpenCL' | 'AVX512')[] = [
  'Vulkan',
  'DirectX 12',
  'OpenGL 4.6',
  'CUDA',
  'ROCm',
  'OpenCL'
];

const DONUT_VARIANTS = [
  'Furry Donut Classic (Kombustor 4K)',
  'Furry Ring Tessellation Extreme',
  'Plasmacube RayTracing Stress Loop',
  'MSI Torus 3D Particle Mesh Burn',
  'Monster Furry Sphere Vulkan 1.3',
  'VRAM Memory Burn 100% Fill Loop',
  'VRM 24-Phase Power Stress Matrix',
  'DirectCompute Shader Flooding Test',
  'RayTracing DXR Bounding Box Stress',
  'CUDA Tensor Core FP16 Heavy Load',
  'GeForce DLSS 3.5 Frame Gen Load',
  'Radeon FSR 3 Frame Interpolation Burn',
  'Dual Donut Multi-GPU SLI/Crossfire',
  'BGA Soldering Thermal Shock Loop',
  'Overclocking Power Throttling Burn',
  '4K HDR Wide Color Gamut Stress',
  '8K Super-Sampling Heavy Mesh',
  'Noise Wave Surface Tessellation',
  'Volumetric Fog & Particle Spark Burn',
  'GPU Core Undervolt Instability Scan'
];

// Generate exactly 2000 distinct FurMark & Benchmark Simulators
export const generate2000FurmarkSimulators = (): FurmarkSimulatorPreset[] => {
  const presets: FurmarkSimulatorPreset[] = [];

  // Expanded GPU Models list
  const EXTENDED_GPU_MODELS = [
    'NVIDIA GeForce RTX 5090 32GB GDDR7',
    'NVIDIA GeForce RTX 5080 16GB GDDR7',
    'NVIDIA GeForce RTX 5070 Ti 16GB GDDR7',
    'NVIDIA GeForce RTX 5070 12GB GDDR7',
    'NVIDIA GeForce RTX 4090 24GB GDDR6X',
    'NVIDIA GeForce RTX 4080 Super 16GB GDDR6X',
    'NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X',
    'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X',
    'NVIDIA GeForce RTX 4060 Ti 16GB GDDR6',
    'NVIDIA GeForce RTX 3090 Ti 24GB GDDR6X',
    'NVIDIA GeForce RTX 3080 Ti 12GB GDDR6X',
    'NVIDIA GeForce RTX 3070 Ti 8GB GDDR6X',
    'AMD Radeon RX 7900 XTX 24GB GDDR6',
    'AMD Radeon RX 7900 XT 20GB GDDR6',
    'AMD Radeon RX 7900 GRE 16GB GDDR6',
    'AMD Radeon RX 7800 XT 16GB GDDR6',
    'AMD Radeon RX 7700 XT 12GB GDDR6',
    'AMD Radeon RX 6950 XT 16GB GDDR6',
    'Intel Arc B580 12GB GDDR6',
    'Intel Arc A770 16GB GDDR6',
    'NVIDIA RTX 6000 Ada Generation 48GB',
    'NVIDIA Quadro RTX 8000 48GB',
    'Apple M3 Max GPU 40-Core 128GB Unified',
    'AMD Instinct MI300X 192GB HBM3'
  ];

  const EXTENDED_DONUT_VARIANTS = [
    'Furry Donut Classic (Kombustor 4K)',
    'Furry Ring Tessellation Extreme',
    'Plasmacube RayTracing Stress Loop',
    'MSI Torus 3D Particle Mesh Burn',
    'Monster Furry Sphere Vulkan 1.3',
    'VRAM Memory Burn 100% Fill Loop',
    'VRM 24-Phase Power Stress Matrix',
    'DirectCompute Shader Flooding Test',
    'RayTracing DXR Bounding Box Stress',
    'CUDA Tensor Core FP16 Heavy Load',
    'GeForce DLSS 3.5 Frame Gen Load',
    'Radeon FSR 3 Frame Interpolation Burn',
    'Dual Donut Multi-GPU SLI/Crossfire',
    'BGA Soldering Thermal Shock Loop',
    'Overclocking Power Throttling Burn',
    '4K HDR Wide Color Gamut Stress',
    '8K Super-Sampling Heavy Mesh',
    'Noise Wave Surface Tessellation',
    'Volumetric Fog & Particle Spark Burn',
    'GPU Core Undervolt Instability Scan',
    'Unigine Superposition Extreme 8K',
    'AIDA64 System Stability FPU Stress',
    'OCCT Linpack AVX2 Thermal Melt',
    'Cinebench 2024 GPU Rendering Test',
    '3DMark Speed Way DXR Stress Loop',
    '3DMark Steel Nomad Native 4K',
    'FurMark 2.2 Knot Mesh Deformation',
    'VRAM MATS / MODS BGA Doctor Scan',
    'PowerSupply OCP 12VHPWR Transient Peak',
    'PCIe Gen5 x16 Bus Bandwidth Stress'
  ];

  // Core base presets first (Handcrafted top tier)
  presets.push(
    {
      id: 'furmark-sim-1',
      name: '🔥 #0001: FurMark 2.1 Vulkan 4K UHD Burn-In (RTX 5090 32GB)',
      category: 'FurMark GPU',
      type: 'GPU',
      gpuName: 'NVIDIA GeForce RTX 5090 32GB GDDR7',
      api: 'Vulkan',
      resolution: '4K UHD',
      targetComponent: 'Rdzeń Blackwell GPU + 32GB GDDR7 VRAM',
      loadType: 'Maksymalny Burn-In Vulkan RT/Tensor',
      description: 'Ekstremalne obciążenie flagowego rdzenia GB202 oraz pamięci GDDR7. Pomiary hotspotu powyżej 95°C.',
      baseCoreTemp: 42,
      peakCoreTemp: 78,
      baseHotspot: 48,
      peakHotspot: 96,
      baseVram: 45,
      peakVram: 90,
      basePower: 50,
      peakPower: 580,
      baseFps: 320,
      peakFps: 240
    },
    {
      id: 'furmark-sim-2',
      name: '🔥 #0002: MSI Kombustor Plasmacube 8K FUHD (RTX 4090 24GB)',
      category: 'MSI Kombustor',
      type: 'GPU',
      gpuName: 'NVIDIA GeForce RTX 4090 24GB GDDR6X',
      api: 'DirectX 12',
      resolution: '8K FUHD',
      targetComponent: 'Rdzeń AD102 GPU & Sekcja Zasilania VRM',
      loadType: '8K Rendering + RayTracing DXR Burn',
      description: 'Testuje wyciąganie najwyższego natężenia prądu (TDP 450W-600W) z gniazda 12VHPWR.',
      baseCoreTemp: 40,
      peakCoreTemp: 75,
      baseHotspot: 46,
      peakHotspot: 92,
      baseVram: 44,
      peakVram: 88,
      basePower: 45,
      peakPower: 490,
      baseFps: 180,
      peakFps: 95
    },
    {
      id: 'furmark-sim-3',
      name: '⚡ #0003: Prime95 Small FFTs + AVX-512 Extreme Heat Loop',
      category: 'Prime95 CPU',
      type: 'CPU',
      gpuName: 'Intel Core i9-14900KS / Ryzen 9 9950X',
      api: 'AVX512',
      resolution: '1080p',
      targetComponent: 'Wszystkie rdzenie CPU + FPU Units',
      loadType: 'Ekstremalne obliczenia FPU / AVX512',
      description: 'Generuje najwyższy skok temperatury rdzeni CPU i sprawdza próg thermal throttlingu 100°C.',
      baseCoreTemp: 38,
      peakCoreTemp: 98,
      baseHotspot: 42,
      peakHotspot: 104,
      baseVram: 35,
      peakVram: 50,
      basePower: 30,
      peakPower: 360,
      baseFps: 0,
      peakFps: 0
    },
    {
      id: 'furmark-sim-4',
      name: '🔋 #0004: OCCT Power Supply 100% TDP System Melt Test',
      category: 'OCCT Power',
      type: 'SYSTEM',
      gpuName: 'NVIDIA RTX 5090 + Intel Core i9-14900K',
      api: 'DirectX 12',
      resolution: '4K UHD',
      targetComponent: 'Cała Stacja + Zasilacz PSU 1200W',
      loadType: 'Jednoczesne 100% CPU + 100% GPU Burn',
      description: 'Symuluje pobór mocy rzędu 900W-1100W z gniazdka 230V. Wykrywa wyłączenia zasilacza (OVP/OCP).',
      baseCoreTemp: 42,
      peakCoreTemp: 89,
      baseHotspot: 48,
      peakHotspot: 98,
      baseVram: 46,
      peakVram: 94,
      basePower: 80,
      peakPower: 1050,
      baseFps: 210,
      peakFps: 160
    },
    {
      id: 'furmark-sim-5',
      name: '💾 #0005: VRAM MATS/MODS 24GB GDDR6X Stress & BGA Doctor',
      category: 'VRAM & BGA',
      type: 'VRAM',
      gpuName: 'AMD Radeon RX 7900 XTX 24GB GDDR6',
      api: 'ROCm',
      resolution: '4K UHD',
      targetComponent: 'Kości Pamięci VRAM + Kulki BGA GPU',
      loadType: 'Test zapisu/odczytu 24GB VRAM pattern 0xAA55',
      description: 'Wykrywa pęknięte kulki BGA pod pamięciami VRAM, błędy artefaktów i zawieszenia magistrali 384-bit.',
      baseCoreTemp: 38,
      peakCoreTemp: 68,
      baseHotspot: 42,
      peakHotspot: 82,
      baseVram: 42,
      peakVram: 96,
      basePower: 40,
      peakPower: 355,
      baseFps: 240,
      peakFps: 205
    }
  );

  // Generate remaining 1995 presets programmatically, making EVERY SINGLE ONE unique!
  const categories: FurmarkSimulatorPreset['category'][] = [
    'FurMark GPU',
    'MSI Kombustor',
    'Prime95 CPU',
    'OCCT Power',
    'AIDA64',
    'Unigine 3D',
    '3DMark',
    'VRAM & BGA',
    'VRM & Power',
    'Cinebench & Compute'
  ];

  for (let i = 6; i <= 2000; i++) {
    const gpu = EXTENDED_GPU_MODELS[(i * 7) % EXTENDED_GPU_MODELS.length];
    const res = RESOLUTIONS[(i * 3) % RESOLUTIONS.length];
    const api = APIS[(i * 11) % APIS.length];
    const category = categories[(i * 13) % categories.length];
    const variant = EXTENDED_DONUT_VARIANTS[(i * 17) % EXTENDED_DONUT_VARIANTS.length];

    const isGpuTest = category === 'FurMark GPU' || category === 'MSI Kombustor' || category === 'Unigine 3D' || category === '3DMark';
    const isCpuTest = category === 'Prime95 CPU' || category === 'Cinebench & Compute';
    const isVramTest = category === 'VRAM & BGA';
    const isVrmTest = category === 'VRM & Power';

    const type: FurmarkSimulatorPreset['type'] = isCpuTest
      ? 'CPU'
      : isVramTest
      ? 'VRAM'
      : isVrmTest
      ? 'VRM'
      : isGpuTest
      ? 'GPU'
      : 'SYSTEM';

    const paddedNum = i.toString().padStart(4, '0');
    const baseCoreTemp = 30 + ((i * 3) % 18);
    const peakCoreTemp = isCpuTest ? 82 + ((i * 5) % 18) : 62 + ((i * 7) % 28);
    const baseHotspot = baseCoreTemp + 5 + (i % 5);
    const peakHotspot = peakCoreTemp + 10 + ((i * 2) % 12);
    const baseVram = 32 + ((i * 4) % 16);
    const peakVram = isVramTest ? 88 + ((i * 3) % 12) : 68 + ((i * 5) % 24);
    const basePower = 30 + ((i * 9) % 35);
    const peakPower = isGpuTest ? 180 + (i * 7) % 450 : isCpuTest ? 120 + (i * 5) % 280 : 350 + (i * 9) % 750;
    const baseFps = isCpuTest ? 0 : 90 + ((i * 13) % 240);
    const peakFps = isCpuTest ? 0 : Math.max(35, baseFps - 20 - (i % 50));

    presets.push({
      id: `furmark-sim-${i}`,
      name: `🔥 #${paddedNum}: ${variant} [${category}] (${gpu.split(' ')[0]} ${gpu.split(' ')[2] || ''} - ${res})`,
      category,
      type,
      gpuName: gpu,
      api,
      resolution: res,
      targetComponent: isCpuTest
        ? `Obciążenie Procesora CPU (${8 + (i % 24)} Rdzeni - Instrukcje ${api})`
        : isVramTest
        ? `Skan Pamięci VRAM (${6 + (i % 28)}GB GDDR6/GDDR7 / magistrala ${(i * 32) % 384 + 128}-bit)`
        : isVrmTest
        ? `Sekcja Zasilania Mosfet/DrMOS (${8 + (i % 20)} Faz zasilania VCORE/NVVDD)`
        : `Główny Rdzeń GPU & Jednostki Compute Shader (${api})`,
      loadType: `${variant} | Silnik Renderujący ${api} / Skan #${paddedNum}`,
      description: `Unikalny symulator obciążeniowy #${paddedNum}. Precyzyjne badanie pętli stresowej, skoków napięć VRM, temperatury Hotspot oraz stabilności VRAM w trybie ${res}.`,
      baseCoreTemp,
      peakCoreTemp,
      baseHotspot,
      peakHotspot,
      baseVram,
      peakVram,
      basePower,
      peakPower,
      baseFps,
      peakFps
    });
  }

  return presets;
};

export const FURMARK_SIMULATORS = generate2000FurmarkSimulators();
export const generate500FurmarkSimulators = generate2000FurmarkSimulators;

