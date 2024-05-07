import * as cd from "colord"
import lchPlugin from "colord/plugins/lch"
cd.extend([lchPlugin])

export const colord = cd.colord

export def toLchArray str
	let res = cd.colord(str).toLch()
	return [res.l,res.c,res.h,res.a]


