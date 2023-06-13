from setuptools import find_packages, setup
from setuptools.command.develop import develop

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in website_builder/__init__.py
from website_builder import __version__ as version


class RunDevelopCommand(develop):
	def run(self):
		import subprocess
		develop.run(self)
		subprocess.check_output("playwright install chromium", shell=True)


setup(
	name="website_builder",
	version=version,
	author="Suraj Shetty",
	author_email="surajshetty3416@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires,
	cmdclass={'develop': RunDevelopCommand},
)
