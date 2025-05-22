#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <vector>
#include <string>
#include <algorithm>

namespace py = pybind11;

// Отримання індексу у вхідному векторі по координатах пікселя
inline size_t pixel_index(int x, int y, int width) {
    return 4 * (y * width + x);
}

// Головна функція застосування фільтра
std::vector<uint8_t> apply_filter_cpp(const std::vector<uint8_t>& data, int width, int height, const std::string& filter_name) {
    std::vector<uint8_t> result = data;

    if (filter_name == "invert") {
        for (size_t i = 0; i + 3 < result.size(); i += 4) {
            result[i]     = 255 - result[i];     // R
            result[i + 1] = 255 - result[i + 1]; // G
            result[i + 2] = 255 - result[i + 2]; // B
            // A не змінюємо
        }
    } else if (filter_name == "blur") {
        std::vector<uint8_t> temp = data;

        for (int y = 1; y < height - 1; ++y) {
            for (int x = 1; x < width - 1; ++x) {
                int sum_r = 0, sum_g = 0, sum_b = 0;
                for (int dy = -1; dy <= 1; ++dy) {
                    for (int dx = -1; dx <= 1; ++dx) {
                        size_t idx = pixel_index(x + dx, y + dy, width);
                        sum_r += temp[idx];
                        sum_g += temp[idx + 1];
                        sum_b += temp[idx + 2];
                    }
                }

                size_t center_idx = pixel_index(x, y, width);
                result[center_idx]     = sum_r / 9;
                result[center_idx + 1] = sum_g / 9;
                result[center_idx + 2] = sum_b / 9;
                // Альфа-канал не змінюється
            }
        }
    }

    return result;
}

// Експортуємо функцію в Python
PYBIND11_MODULE(filter, m) {
    m.def("apply_filter_cpp", &apply_filter_cpp, "Apply a filter to an image",
          py::arg("data"), py::arg("width"), py::arg("height"), py::arg("filter_name"));
}
