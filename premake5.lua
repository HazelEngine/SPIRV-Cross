project "SPIRVC"
	kind "StaticLib"
	language "C++"

	targetdir ("bin/" .. outputdir .. "/%{prj.name}")
	objdir ("bin-int/" .. outputdir .. "/%{prj.name}")

	files
	{
		"spirv.hpp",
		"spirv_cfg.hpp",
		"spirv_cfg.cpp",
		"spirv_common.hpp",
		"spirv_cross.hpp",
		"spirv_cross.cpp",
		"spirv_cross_containers.hpp",
		"spirv_cross_error_handling.hpp",
		"spirv_cross_parsed_ir.hpp",
		"spirv_cross_parsed_ir.cpp",
		"spirv_cross_util.hpp",
		"spirv_cross_util.cpp",
		"spirv_parser.hpp",
		"spirv_parser.cpp",
		"spirv_glsl.hpp",
		"spirv_glsl.cpp",
		"GLSL.std.450.h"
	}

	filter "system:windows"
		systemversion "latest"
		cppdialect "C++17"
		staticruntime "On"

	filter { "system:windows", "configurations:Release" }
		buildoptions "/MT"