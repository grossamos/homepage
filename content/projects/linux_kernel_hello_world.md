---
title: "Linux Kernel Modules: A Guide to Hello World"
date: 2021-05-30T20:34:54+02:00
draft: false
---

# Linux Kernel Modules: A Guide to Hello World
## Preparation
In order to be able to compile and load kernel modules you will need to compile against (and then run with) a kernel source tree.
There are allready thousands of guides on compiling custom kernels, so this will only be a quick overview.
### Get the kernel source
First step is to clone the kernel source:
``` bash
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
```
Then checkout the newest stable kernel tag (in our case 5.12):
```bash
git checkout v5.12
```
### Configure Kernel and Build Environment
First download all dependencies (this is using dnf, but simmilar packages exist for apt, pacman, etc.):
```bash
sudo dnf install gcc make git ctags ncurses-devel openssl-devel
```
Next copy over the ``.config`` file from your already existing kernel:
```bash
cp /boot/config-`uname -r`* .config
```
Finally run the tui configurer and select any drivers you setup might need (ex. additional Touchpad drivers):
```bash
make menuconfig
```
### Compile and Install the Kernel
Now the actuall compilation, with the optional -j option specifying how many threads to use:
```bash
make -j 6
make modules

# as super user
make modules_install
```
To install the kernel run:
``` bash
make install
```
*Note: this last step didn't work on my grub based system, here it is nessicary to copy over bzimage and configration over to ``/boot`` and reload grub manually*

## Writing, Compliling and loading
Now to the actual module code:
```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/shed.h>
#include <asm/current.h>

MODULE_LICENSE("Dual BSD/GPL");

static int hello_init(void)
{
	printk(KERN_ALERT "Hello, world, it's mothafucking ultraman\n");
	return 0;
}

static void hello_exit(void)
{
	printk(KERN_ALERT "Ultraman out\n");
}

module_init(hello_init);
module_exit(hello_exit);
```
Hereby the macros ``module_init`` and ``module_exit`` specify what functions to call when loading and unloading the module.
In our case, we're calling ``printk``, which is simmilar to ``printf`` from stdlib (but can't be used in the module, as the c standard library runs in user space).

In order to compile our module, we also need a make file, that can bind in with the kernel build process:
```make
obj-m := hello.o
```
Here we called our hello world file ``hello.c``.
The Makefile looks oddly far away from what one would be used to and this is due to the complex kernel build process that it will later hook into.

To then make the module, run:
```bash
make -C <path_to_kernel_source> M=`pwd` modules
```

After this you should see a bunch of files in the current directory, including ``hello.ko``.
This file we will now use to load our module:
```bash
# as superuser
insmod hello.ko
```

We can remove it again using:
```bash
# also as superuser
rmmod hello
```

If we now take a look into the syslog, we will be able to see our messages.
To do this, run:
```bash
# also superuser
dmesg
```

You have now written, compiled and loaded your first kernel module, congrats!

