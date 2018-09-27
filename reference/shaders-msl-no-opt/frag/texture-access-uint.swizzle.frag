#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct spvAux
{
    uint swizzleConst[1];
};

// Returns 2D texture coords corresponding to 1D texel buffer coords
uint2 spvTexelBufferCoord(uint tc)
{
    return uint2(tc % 4096, tc / 4096);
}

enum class spvSwizzle : uint
{
    none = 0,
    zero,
    one,
    red,
    green,
    blue,
    alpha
};

template<typename T> struct spvRemoveReference { typedef T type; };
template<typename T> struct spvRemoveReference<thread T&> { typedef T type; };
template<typename T> struct spvRemoveReference<thread T&&> { typedef T type; };
template<typename T> inline constexpr thread T&& spvForward(thread typename spvRemoveReference<T>::type& x)
{
    return static_cast<thread T&&>(x);
}
template<typename T> inline constexpr thread T&& spvForward(thread typename spvRemoveReference<T>::type&& x)
{
    return static_cast<thread T&&>(x);
}

template<typename T>
inline T spvGetSwizzle(vec<T, 4> x, spvSwizzle s)
{
    switch (s)
    {
        case spvSwizzle::zero:
            return 0;
        case spvSwizzle::one:
            return 1;
        case spvSwizzle::red:
            return x.r;
        case spvSwizzle::green:
            return x.g;
        case spvSwizzle::blue:
            return x.b;
        case spvSwizzle::alpha:
            return x.a;
        default:
            break;
    }
    return 0;
}

// Wrapper function that swizzles texture samples and fetches.
template<typename T>
inline vec<T, 4> spvTextureSwizzle(vec<T, 4> x, uint s)
{
    if (!s)
        return x;
    return vec<T, 4>(spvGetSwizzle(x, spvSwizzle((s >> 0) & 0xFF)), spvGetSwizzle(x, spvSwizzle((s >> 8) & 0xFF)), spvGetSwizzle(x, spvSwizzle((s >> 16) & 0xFF)), spvGetSwizzle(x, spvSwizzle((s >> 24) & 0xFF)));
}

template<typename T>
inline T spvTextureSwizzle(T x, uint s)
{
    return spvTextureSwizzle(vec<T, 4>(x, 0, 0, 1), s).x;
}

// Wrapper function that swizzles texture gathers.
template<typename T, typename Tex, typename... Ts>
inline vec<T, 4> spvGatherSwizzle(sampler s, thread Tex& t, Ts... params, component c, uint sw) METAL_CONST_ARG(c)
{
    if (sw)
    {
        switch (spvSwizzle((sw >> (uint(c) * 8)) & 0xFF))
        {
            case spvSwizzle::none:
                break;
            case spvSwizzle::zero:
                return vec<T, 4>(0, 0, 0, 0);
            case spvSwizzle::one:
                return vec<T, 4>(1, 1, 1, 1);
            case spvSwizzle::red:
                return t.gather(s, spvForward<Ts>(params)..., component::x);
            case spvSwizzle::green:
                return t.gather(s, spvForward<Ts>(params)..., component::y);
            case spvSwizzle::blue:
                return t.gather(s, spvForward<Ts>(params)..., component::z);
            case spvSwizzle::alpha:
                return t.gather(s, spvForward<Ts>(params)..., component::w);
        }
    }
    switch (c)
    {
        case component::x:
            return t.gather(s, spvForward<Ts>(params)..., component::x);
        case component::y:
            return t.gather(s, spvForward<Ts>(params)..., component::y);
        case component::z:
            return t.gather(s, spvForward<Ts>(params)..., component::z);
        case component::w:
            return t.gather(s, spvForward<Ts>(params)..., component::w);
    }
}

fragment void main0(constant spvAux& spvAuxBuffer [[buffer(0)]], texture1d<uint> tex1d [[texture(0)]], texture2d<uint> tex2d [[texture(1)]], texture3d<uint> tex3d [[texture(2)]], texturecube<uint> texCube [[texture(3)]], texture2d_array<uint> tex2dArray [[texture(4)]], texturecube_array<uint> texCubeArray [[texture(5)]], texture2d<uint> texBuffer [[texture(6)]], sampler tex1dSmplr [[sampler(0)]], sampler tex2dSmplr [[sampler(1)]], sampler tex3dSmplr [[sampler(2)]], sampler texCubeSmplr [[sampler(3)]], sampler tex2dArraySmplr [[sampler(4)]], sampler texCubeArraySmplr [[sampler(5)]])
{
    float4 c = float4(spvTextureSwizzle(tex1d.sample(tex1dSmplr, 0.0), spvAuxBuffer.swizzleConst[0]));
    c = float4(spvTextureSwizzle(tex2d.sample(tex2dSmplr, float2(0.0)), spvAuxBuffer.swizzleConst[1]));
    c = float4(spvTextureSwizzle(tex3d.sample(tex3dSmplr, float3(0.0)), spvAuxBuffer.swizzleConst[2]));
    c = float4(spvTextureSwizzle(texCube.sample(texCubeSmplr, float3(0.0)), spvAuxBuffer.swizzleConst[3]));
    c = float4(spvTextureSwizzle(tex2dArray.sample(tex2dArraySmplr, float3(0.0).xy, uint(round(float3(0.0).z))), spvAuxBuffer.swizzleConst[4]));
    c = float4(spvTextureSwizzle(texCubeArray.sample(texCubeArraySmplr, float4(0.0).xyz, uint(round(float4(0.0).w))), spvAuxBuffer.swizzleConst[5]));
    c = float4(spvTextureSwizzle(tex1d.sample(tex1dSmplr, float2(0.0, 1.0).x / float2(0.0, 1.0).y), spvAuxBuffer.swizzleConst[0]));
    c = float4(spvTextureSwizzle(tex2d.sample(tex2dSmplr, float3(0.0, 0.0, 1.0).xy / float3(0.0, 0.0, 1.0).z), spvAuxBuffer.swizzleConst[1]));
    c = float4(spvTextureSwizzle(tex3d.sample(tex3dSmplr, float4(0.0, 0.0, 0.0, 1.0).xyz / float4(0.0, 0.0, 0.0, 1.0).w), spvAuxBuffer.swizzleConst[2]));
    c = float4(spvTextureSwizzle(tex1d.sample(tex1dSmplr, 0.0), spvAuxBuffer.swizzleConst[0]));
    c = float4(spvTextureSwizzle(tex2d.sample(tex2dSmplr, float2(0.0), level(0.0)), spvAuxBuffer.swizzleConst[1]));
    c = float4(spvTextureSwizzle(tex3d.sample(tex3dSmplr, float3(0.0), level(0.0)), spvAuxBuffer.swizzleConst[2]));
    c = float4(spvTextureSwizzle(texCube.sample(texCubeSmplr, float3(0.0), level(0.0)), spvAuxBuffer.swizzleConst[3]));
    c = float4(spvTextureSwizzle(tex2dArray.sample(tex2dArraySmplr, float3(0.0).xy, uint(round(float3(0.0).z)), level(0.0)), spvAuxBuffer.swizzleConst[4]));
    c = float4(spvTextureSwizzle(texCubeArray.sample(texCubeArraySmplr, float4(0.0).xyz, uint(round(float4(0.0).w)), level(0.0)), spvAuxBuffer.swizzleConst[5]));
    c = float4(spvTextureSwizzle(tex1d.sample(tex1dSmplr, float2(0.0, 1.0).x / float2(0.0, 1.0).y), spvAuxBuffer.swizzleConst[0]));
    c = float4(spvTextureSwizzle(tex2d.sample(tex2dSmplr, float3(0.0, 0.0, 1.0).xy / float3(0.0, 0.0, 1.0).z, level(0.0)), spvAuxBuffer.swizzleConst[1]));
    c = float4(spvTextureSwizzle(tex3d.sample(tex3dSmplr, float4(0.0, 0.0, 0.0, 1.0).xyz / float4(0.0, 0.0, 0.0, 1.0).w, level(0.0)), spvAuxBuffer.swizzleConst[2]));
    c = float4(spvTextureSwizzle(tex1d.read(uint(0)), spvAuxBuffer.swizzleConst[0]));
    c = float4(spvTextureSwizzle(tex2d.read(uint2(int2(0)), 0), spvAuxBuffer.swizzleConst[1]));
    c = float4(spvTextureSwizzle(tex3d.read(uint3(int3(0)), 0), spvAuxBuffer.swizzleConst[2]));
    c = float4(spvTextureSwizzle(tex2dArray.read(uint2(int3(0).xy), uint(int3(0).z), 0), spvAuxBuffer.swizzleConst[4]));
    c = float4(texBuffer.read(spvTexelBufferCoord(0)));
    c = float4(spvGatherSwizzle<uint, texture2d<uint>, float2, int2>(tex2dSmplr, tex2d, float2(0.0), int2(0), component::x, spvAuxBuffer.swizzleConst[1]));
    c = float4(spvGatherSwizzle<uint, texturecube<uint>, float3>(texCubeSmplr, texCube, float3(0.0), component::y, spvAuxBuffer.swizzleConst[3]));
    c = float4(spvGatherSwizzle<uint, texture2d_array<uint>, float2, uint, int2>(tex2dArraySmplr, tex2dArray, float3(0.0).xy, uint(round(float3(0.0).z)), int2(0), component::z, spvAuxBuffer.swizzleConst[4]));
    c = float4(spvGatherSwizzle<uint, texturecube_array<uint>, float3, uint>(texCubeArraySmplr, texCubeArray, float4(0.0).xyz, uint(round(float4(0.0).w)), component::w, spvAuxBuffer.swizzleConst[5]));
}
