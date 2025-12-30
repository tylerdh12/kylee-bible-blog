import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/10 p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<div className='flex justify-center mb-4'>
						<div className='p-4 rounded-full bg-primary/10'>
							<Wrench className='h-12 w-12 text-primary' />
						</div>
					</div>
					<CardTitle className='text-2xl'>Site Under Maintenance</CardTitle>
					<CardDescription>
						We're currently performing some updates to improve your experience.
					</CardDescription>
				</CardHeader>
				<CardContent className='text-center space-y-4'>
					<p className='text-muted-foreground'>
						We'll be back online shortly. Thank you for your patience!
					</p>
					<div className='pt-4 border-t'>
						<p className='text-sm text-muted-foreground'>
							If you're an administrator, you can disable maintenance mode from the{' '}
							<a
								href='/admin/settings'
								className='text-primary hover:underline font-medium'
							>
								admin settings
							</a>
							.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
