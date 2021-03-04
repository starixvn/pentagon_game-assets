#!/usr/bin/python

import os
import shutil
import subprocess

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.realpath(__file__))
    project_dir = os.path.join(current_dir, '..')

    images_dir = 'money_unity_client'

    # Pack.
    packer_path = os.path.join(
        project_dir,
        '0_texturepacker',
        'ee-scripts',
        'pack.js'
    )

    subprocess.Popen([
        'node',
        packer_path,
        '-t',
        'remote',
        '-a',
        'http://10.10.50.17:3456',
        '-i',
        os.path.join(project_dir, '0_texturepacker', '..', images_dir, 'texture_packer.json'),
        '-o',
        os.path.join(project_dir, '0_texturepacker', '..', images_dir, 'packed')
    ]).wait()

    # Copy resources (PNG) for editor.
    # resource_dir = os.path.join(
    #     project_dir,
    #     'assets', 'resources', 'packed'
    # )
    # png_pack_dir = os.path.join(
    #     project_dir,
    #     'texture_packer',
    #     'packed', 'png',
    # )

    # for d in os.listdir(png_pack_dir):
    #     if not d.startswith('.'):
            # src = os.path.join(png_pack_dir, d)
            # dst = os.path.join(resource_dir, d)
            # if os.path.exists(dst):
            #    os.remove(dst)
            # shutil.copy(src, dst)