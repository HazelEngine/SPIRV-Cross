#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float gl_FragDepth [[depth(less)]];
};

[[ early_fragment_tests ]] fragment main0_out main0()
{
    main0_out out = {};
    out.gl_FragDepth = 0.5;
    return out;
}
