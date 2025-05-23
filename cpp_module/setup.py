from setuptools import setup, Extension
from pybind11.setup_helpers import Pybind11Extension

ext_modules = [
    Pybind11Extension(
        "filter",
        ["filter.cpp"],
    ),
]

setup(
    name="filter",
    ext_modules=ext_modules,
    zip_safe=False,
)