---
title: "Developing Linux Kernel Modules in Qemu"
date: 2021-06-13T20:34:54+02:00
draft: false
---

# Developing Linux Kernel Modules in Qemu
## High level overview
#### Why Qemu?
Wrighting, loading and compiling kernel modules on a running system is fairly straight forward, it only really requires running two commands after all. 
So why have a development environment in [qemu](https://wiki.qemu.org/Main_Page)? 

As happens quite often in low level and systems programming, small oversights and memory management errors can happen quite often. 
With userspace programms this is usually okay, as segfaults and other errors usually only kill the current process. 
This is different in kernel code, if you mess up here it can take down your entire system, which is annoying as hell.

Qemu is one of the ways this issue can be solved, by running kernel modules in a virtual environment, they to become userspace processes on your machine. If you mess up, you can just recompile and get going again, no restarts needed.

#### Conceptual Approach
Within our qemu setup we will mostly abuse initramfs, the initial filesystem used to load the root filesystem when booting a linux system. 
Eventhough it's only temporary, it is a complete userspace, thus making it perfect for testing out new modules.

Hereby the development cycle can be summarised as follows
1. compiling kernel + modules
2. creating initramfs image (with busybox, testscripts and needed binarys)
3. starting qemu
4. performing tests on the kernel module at hand
5. repeat...

## Execution
#### Preparation
To start off you obviously need to install qemu:
```bash
# debian
apt install qemu

# arch
pacman install qemu

# fedora/RHEL
dnf insatll qemu
```
#### Compiling the kernel and modules
In order to boot the kernel in qemu you will also need to build it.
I've allready explained this in [a previous article](https://www.amosgross.com/projects/linux_kernel_hello_world/), so I won't be repeating myself. 

However important to note is that we only need the statically linked ``bzImage`` file, thus it will not be nessicary to go through most of the usual steps. 
It bascially boils down to:
```bash
make -j4
make modules
# the image should now be under ./arch/<architecture>/boot/bzImage
```
#### Compile busybox
Since we'll propbably want basic UNIX utilities, like ls, cd and cat, we'll make use of busybox.
First off, You'll need to retrieve the source with:
```bash
git clone https://git.busybox.net/busybox
```

Then configure the utilities and overall config with:
```bash
# create .config
make defconfig

# enable the static binary option (under settings > build)
make menuconfig
```

When your done compile and install it (install in this case will only create a couple of symlinks in the ``_install`` directory):
```bash
make
make install
```

#### Prepare initial filesystem
Now it's time to create the rough filesystem we'll be using. 
We'll start off by creating the folder structure and then copying over the busybox binaries:
```bash
mkdir initramfs && cd initramfs
mkdir -pv {bin,sbin,etc,proc,sys,usr/{bin,sbin}}
cp -av ~/dev/busybox/_install/* .
```

This would would also be the point to copy over any objectfiles or tests you'll need later on.

#### Create the initial process
No it's time to create pid 1 within the initramfs userspace.
Create and edit a file called "init" within the root of the filesystem created in the last step:
```bash
#!/bin/sh
 
mount -t proc none /proc
mount -t sysfs none /sys
mount -t debugfs none /sys/kernel/debug
mount -t devtmpfs none /dev

echo -e "\nBoot took $(cut -d' ' -f1 /proc/uptime) seconds\n"
echo "Welcome Ultraman..."


# Insert any tests that should be executed at startup here

setsid /bin/cttyhack /bin/sh
```
#### Create cpio image
Now it's time to pack all of that into a cpio image for qemu to use:
```bash
find . | cpio -H newc -o > ../initramfs.cpio
cd ..
cat initramfs.cpio | gzip > initramfs.igz
```
#### Running qemu
Now pretty much everything should be set and you can now boot up qemu with:
```bash 
qemu-system-x86_64 -enable-kvm -kernel <linux_source_tree_location>arch/x86_64/boot/bzImage -initrd ./initramfs.igz -nographic --append console=ttyS0
```

During development you would usually pack the steps for creating the cpio image into a bash script and then only execute that.
