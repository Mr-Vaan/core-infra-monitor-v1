import { VirtualizationType } from '../types';

export interface VirtualizationPlatformMeta {
  value: VirtualizationType;
  label: string;
  category: 'Enterprise HCI & Hypervisor' | 'Open Source & Linux KVM' | 'Private Cloud & Telco IaaS' | 'Cloud-Native & Kubernetes' | 'Hyperscaler Hybrid & Bare-Metal';
  defaultPort: number;
  defaultEndpoint: string;
  authPlaceholder: string;
  description: string;
  vendor: string;
}

export const VIRTUALIZATION_PLATFORMS: VirtualizationPlatformMeta[] = [
  // 1. Enterprise HCI & On-Premises Hypervisors
  {
    value: 'Proxmox VE',
    label: 'Proxmox VE (KVM / LXC / Ceph HCI)',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 8006,
    defaultEndpoint: 'https://pve-cluster.corp.internal:8006/api2/json',
    authPlaceholder: 'root@pam!token',
    description: 'Enterprise open-source hypervisor with native KVM, LXC, and distributed Ceph storage.',
    vendor: 'Proxmox Server Solutions'
  },
  {
    value: 'VMware vSphere / ESXi',
    label: 'VMware vSphere / ESXi (vCenter Server 7/8)',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 443,
    defaultEndpoint: 'https://vcenter.corp.internal/sdk',
    authPlaceholder: 'administrator@vsphere.local',
    description: 'Enterprise Type-1 bare-metal hypervisor managed by VMware vCenter Server REST/SOAP API.',
    vendor: 'Broadcom / VMware'
  },
  {
    value: 'Nutanix AHV',
    label: 'Nutanix AHV (Acropolis Hypervisor & Prism)',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 9440,
    defaultEndpoint: 'https://prism-central.corp.internal:9440/api/nutanix/v3',
    authPlaceholder: 'admin@prism',
    description: 'Turnkey hyperconverged infrastructure with Acropolis Distributed Storage Fabric (DSF).',
    vendor: 'Nutanix Inc.'
  },
  {
    value: 'Microsoft Hyper-V / Azure Stack HCI',
    label: 'Microsoft Hyper-V / Azure Stack HCI',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 6516,
    defaultEndpoint: 'https://hyperv-wac.corp.internal:6516/api',
    authPlaceholder: 'DOMAIN\\Administrator',
    description: 'Windows Server Hyper-V & Azure Stack HCI cluster telemetry via Windows Admin Center.',
    vendor: 'Microsoft'
  },
  {
    value: 'Sangfor HCI (aCloud)',
    label: 'Sangfor HCI (aCloud Architecture)',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 4430,
    defaultEndpoint: 'https://sangfor-hci.corp.internal:4430/api/v1',
    authPlaceholder: 'admin',
    description: 'Hyperconverged software-defined compute, storage, and network security stack.',
    vendor: 'Sangfor Technologies'
  },
  {
    value: 'Huawei FusionSphere / FusionCompute',
    label: 'Huawei FusionSphere / FusionCompute',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 7443,
    defaultEndpoint: 'https://fusionsphere.corp.internal:7443/api',
    authPlaceholder: 'admin',
    description: 'Cloud OS virtualization platform optimized for enterprise telecommunication and data centers.',
    vendor: 'Huawei Technologies'
  },
  {
    value: 'Cisco HyperFlex HCI',
    label: 'Cisco HyperFlex HCI (HX Data Platform)',
    category: 'Enterprise HCI & Hypervisor',
    defaultPort: 443,
    defaultEndpoint: 'https://hyperflex-connect.corp.internal/rest/v1',
    authPlaceholder: 'admin',
    description: 'Unified computing system (UCS) with Cisco HX Distributed File System integration.',
    vendor: 'Cisco Systems'
  },

  // 2. Open Source & Linux KVM / Xen / Bhyve
  {
    value: 'oVirt / Red Hat Enterprise Virtualization',
    label: 'oVirt / Red Hat Enterprise Virtualization (RHEV / OLVM)',
    category: 'Open Source & Linux KVM',
    defaultPort: 443,
    defaultEndpoint: 'https://ovirt-engine.corp.internal/ovirt-engine/api',
    authPlaceholder: 'admin@internal',
    description: 'Full-featured centralized virtualization management platform for Linux KVM clusters.',
    vendor: 'Red Hat / oVirt Community'
  },
  {
    value: 'Citrix XenServer / XCP-ng',
    label: 'Citrix XenServer / XCP-ng (Xen Hypervisor Pool)',
    category: 'Open Source & Linux KVM',
    defaultPort: 443,
    defaultEndpoint: 'https://xcp-poolmaster.corp.internal/json_rpc',
    authPlaceholder: 'root',
    description: 'Enterprise open-source virtualization platform powered by Xen Project hypervisor.',
    vendor: 'Vates / Xen Project'
  },
  {
    value: 'Harvester HCI (SUSE / Rancher)',
    label: 'Harvester HCI (SUSE / Rancher Cloud-Native HCI)',
    category: 'Open Source & Linux KVM',
    defaultPort: 443,
    defaultEndpoint: 'https://harvester-vip.corp.internal/v1/harvester',
    authPlaceholder: 'Bearer token-xxxx',
    description: 'Open-source hyperconverged infrastructure software built on Kubernetes and KubeVirt.',
    vendor: 'SUSE / Rancher'
  },
  {
    value: 'Canonical MicroCloud / LXD',
    label: 'Canonical MicroCloud / LXD (System Containers & VMs)',
    category: 'Open Source & Linux KVM',
    defaultPort: 8443,
    defaultEndpoint: 'https://lxd-cluster.corp.internal:8443/1.0',
    authPlaceholder: 'client.crt / TLS Token',
    description: 'Next-generation system container and virtual machine manager for lightweight private clouds.',
    vendor: 'Canonical Ltd.'
  },
  {
    value: 'SmartOS / Joyent Triton (Illumos)',
    label: 'SmartOS / Joyent Triton (Illumos ZFS & KVM)',
    category: 'Open Source & Linux KVM',
    defaultPort: 443,
    defaultEndpoint: 'https://triton-cAPI.corp.internal/my/machines',
    authPlaceholder: 'root / SSH Key',
    description: 'Specialized Type-1 hypervisor OS based on illumos featuring ZFS and container zones.',
    vendor: 'MNX Solutions / Joyent'
  },
  {
    value: 'Oracle Linux KVM / OLVM',
    label: 'Oracle Linux KVM / OLVM',
    category: 'Open Source & Linux KVM',
    defaultPort: 443,
    defaultEndpoint: 'https://olvm-engine.corp.internal/ovirt-engine/api',
    authPlaceholder: 'admin@internal',
    description: 'Server virtualization solution designed for Oracle enterprise databases and middleware workloads.',
    vendor: 'Oracle Corporation'
  },
  {
    value: 'FreeBSD Bhyve',
    label: 'FreeBSD Bhyve (Enterprise Bare-Metal)',
    category: 'Open Source & Linux KVM',
    defaultPort: 8443,
    defaultEndpoint: 'https://bhyve-host.corp.internal:8443/api',
    authPlaceholder: 'root / API Token',
    description: 'Modern FreeBSD hypervisor supporting UEFI boot, PCI passthrough, and native ZFS pools.',
    vendor: 'FreeBSD Foundation'
  },

  // 3. Private Cloud & Telco IaaS
  {
    value: 'OpenStack',
    label: 'OpenStack (Nova Compute / KVM / Neutron)',
    category: 'Private Cloud & Telco IaaS',
    defaultPort: 5000,
    defaultEndpoint: 'https://keystone.corp.internal:5000/v3',
    authPlaceholder: 'admin / OS_TOKEN',
    description: 'Massively scalable open cloud operating system orchestrating compute, storage, and networking.',
    vendor: 'Open Infrastructure Foundation'
  },
  {
    value: 'Apache CloudStack',
    label: 'Apache CloudStack (KVM / Xen / VMware)',
    category: 'Private Cloud & Telco IaaS',
    defaultPort: 8080,
    defaultEndpoint: 'https://cloudstack-mgmt.corp.internal:8080/client/api',
    authPlaceholder: 'apiKey & secretKey',
    description: 'High-availability infrastructure-as-a-service cloud computing platform.',
    vendor: 'Apache Software Foundation'
  },
  {
    value: 'OpenNebula Enterprise Cloud',
    label: 'OpenNebula Enterprise Cloud',
    category: 'Private Cloud & Telco IaaS',
    defaultPort: 2633,
    defaultEndpoint: 'https://one-front.corp.internal:2633/RPC2',
    authPlaceholder: 'oneadmin:password',
    description: 'Simple, scalable enterprise solution to build private clouds and manage data center virtualization.',
    vendor: 'OpenNebula Systems'
  },

  // 4. Cloud-Native & Kubernetes Virtualization
  {
    value: 'Red Hat OpenShift Virtualization (KubeVirt)',
    label: 'Red Hat OpenShift Virtualization (KubeVirt Engine)',
    category: 'Cloud-Native & Kubernetes',
    defaultPort: 6443,
    defaultEndpoint: 'https://api.openshift.corp.internal:6443/apis/kubevirt.io/v1',
    authPlaceholder: 'Bearer sha256~token',
    description: 'Run and manage virtual machine workloads alongside Kubernetes containers on OpenShift.',
    vendor: 'Red Hat'
  },
  {
    value: 'SUSE Rancher Harvester KubeVirt',
    label: 'SUSE Rancher Harvester KubeVirt',
    category: 'Cloud-Native & Kubernetes',
    defaultPort: 6443,
    defaultEndpoint: 'https://rancher.corp.internal/k8s/clusters/c-m-xxxx/apis/kubevirt.io',
    authPlaceholder: 'Bearer kubeconfig token',
    description: 'Unified management of Harvester bare-metal virtualization through Rancher Multi-Cluster Manager.',
    vendor: 'SUSE / Rancher'
  },
  {
    value: 'VMware Tanzu Kubernetes Grid (TKG)',
    label: 'VMware Tanzu Kubernetes Grid (TKG & vSphere Pods)',
    category: 'Cloud-Native & Kubernetes',
    defaultPort: 6443,
    defaultEndpoint: 'https://tkg-mgmt.corp.internal:6443/apis',
    authPlaceholder: 'Bearer Tanzu Token',
    description: 'Enterprise Kubernetes runtime with native ESXi hypervisor pod isolation and CRDs.',
    vendor: 'VMware Tanzu'
  },

  // 5. Hyperscaler Hybrid & Dedicated Bare-Metal
  {
    value: 'Google Cloud VMware Engine (GCVE)',
    label: 'Google Cloud VMware Engine (GCVE)',
    category: 'Hyperscaler Hybrid & Bare-Metal',
    defaultPort: 443,
    defaultEndpoint: 'https://gcve-vcenter.corp.internal/sdk',
    authPlaceholder: 'cloudadmin@corp.local',
    description: 'Fully managed VMware Software-Defined Data Center (SDDC) running on Google Cloud dedicated infrastructure.',
    vendor: 'Google Cloud'
  },
  {
    value: 'Azure VMware Solution (AVS)',
    label: 'Azure VMware Solution (AVS)',
    category: 'Hyperscaler Hybrid & Bare-Metal',
    defaultPort: 443,
    defaultEndpoint: 'https://avs-vcenter.corp.internal/sdk',
    authPlaceholder: 'cloudadmin@vsphere.local',
    description: 'Dedicated bare-metal Azure infrastructure running VMware vSphere, vSAN, and NSX-T.',
    vendor: 'Microsoft Azure'
  },
  {
    value: 'AWS Outposts / EC2 Nitro Bare Metal',
    label: 'AWS Outposts / EC2 Nitro Bare Metal',
    category: 'Hyperscaler Hybrid & Bare-Metal',
    defaultPort: 443,
    defaultEndpoint: 'https://outposts.ap-southeast-3.amazonaws.com',
    authPlaceholder: 'AWS_ACCESS_KEY_ID:SECRET',
    description: 'AWS infrastructure, native AWS services, APIs, and tools extended to on-premises data centers.',
    vendor: 'Amazon Web Services'
  },
  {
    value: 'Oracle Cloud VMware Solution (OCVS)',
    label: 'Oracle Cloud VMware Solution (OCVS)',
    category: 'Hyperscaler Hybrid & Bare-Metal',
    defaultPort: 443,
    defaultEndpoint: 'https://ocvs-vcenter.corp.internal/sdk',
    authPlaceholder: 'ocvs-admin@vsphere.local',
    description: 'Dedicated cloud environment providing full administrative control over VMware SDDC on OCI.',
    vendor: 'Oracle Cloud'
  }
];

export const VIRTUALIZATION_CATEGORIES = [
  'Enterprise HCI & Hypervisor',
  'Open Source & Linux KVM',
  'Private Cloud & Telco IaaS',
  'Cloud-Native & Kubernetes',
  'Hyperscaler Hybrid & Bare-Metal'
] as const;

export function getPlatformMeta(type: string): VirtualizationPlatformMeta | undefined {
  return VIRTUALIZATION_PLATFORMS.find(p => p.value === type || p.label === type);
}
