import { BookOpen, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HomeScreen({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Kit-Build 개념 지도</h1>
        <p className="text-lg text-gray-500">지식 재구성을 통한 효과적인 학습 도구</p>
      </div>

      <div className="grid grid-cols-2 gap-8 max-w-3xl w-full">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
              <BookOpen className="w-10 h-10 text-orange-500" />
            </div>
            <CardTitle className="text-xl">교사 모드</CardTitle>
            <CardDescription className="text-sm mt-2">
              개념 지도를 작성하고 키트를 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => onSelectMode('teacher')}
              aria-label="교사 모드 시작하기"
            >
              시작하기
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
              <GraduationCap className="w-10 h-10 text-blue-500" />
            </div>
            <CardTitle className="text-xl">학생 모드</CardTitle>
            <CardDescription className="text-sm mt-2">
              키트를 재조립하여 지식을 구성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => onSelectMode('student')}
              aria-label="학생 모드 시작하기"
            >
              시작하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
