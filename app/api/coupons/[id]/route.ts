import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon ID' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: id },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: `Coupon with ID ${id} not found.` },
        { status: 404 }
      );
    }

    const couponClaim = await prisma.claim.findFirst({
      where: { couponId: id },
    });

    if (couponClaim) {
      console.log(`Coupon with ID ${id} is claimed, but will still be deleted.`);
      await prisma.claim.delete({
        where: { id: couponClaim.id },
      });
    }

    const deletedCoupon = await prisma.coupon.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, coupon: deletedCoupon });
  } catch (error) {
    console.error('Error deleting coupon:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to delete coupon, please try again later.' },
      { status: 500 }
    );
  }
}
